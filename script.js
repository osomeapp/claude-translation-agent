document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('translationForm');
    const inputText = document.getElementById('inputText');
    const translateBtn = document.getElementById('translateBtn');
    const resultDiv = document.getElementById('result');
    const translatedText = document.getElementById('translatedText');
    const targetLanguage = document.getElementById('targetLanguage');
    
    let currentTargetLang = 'zh';
    
    // Text-to-Speech elements
    const speakBtn = document.getElementById('speakBtn');
    const stopBtn = document.getElementById('stopBtn');
    const voiceSelect = document.getElementById('voiceSelect');
    const volumeSlider = document.getElementById('volumeSlider');
    
    // Speech synthesis setup
    let currentUtterance = null;
    let voices = [];

    // Load available voices
    function loadVoices() {
        voices = speechSynthesis.getVoices();
        updateVoiceOptions();
    }
    
    // Update voice options based on target language
    function updateVoiceOptions() {
        voiceSelect.innerHTML = '<option value="">Auto Voice</option>';
        
        let targetVoices = [];
        let fallbackVoices = [];
        
        if (currentTargetLang === 'zh') {
            // Filter for Chinese voices
            targetVoices = voices.filter(voice => 
                voice.lang.startsWith('zh') || 
                voice.lang.includes('Chinese') ||
                voice.name.includes('Chinese') ||
                voice.name.includes('Mandarin')
            );
            fallbackVoices = voices.filter(voice => 
                !voice.lang.startsWith('zh') && !voice.lang.includes('Chinese')
            );
        } else if (currentTargetLang === 'fil') {
            // Filter for Filipino/Tagalog voices
            targetVoices = voices.filter(voice => 
                voice.lang.startsWith('fil') || 
                voice.lang.startsWith('tl') ||
                voice.lang.includes('Filipino') ||
                voice.lang.includes('Tagalog') ||
                voice.name.includes('Filipino') ||
                voice.name.includes('Tagalog')
            );
            fallbackVoices = voices.filter(voice => 
                !voice.lang.startsWith('fil') && !voice.lang.startsWith('tl') && 
                !voice.lang.includes('Filipino') && !voice.lang.includes('Tagalog')
            );
        } else if (currentTargetLang === 'en') {
            // Filter for English voices
            targetVoices = voices.filter(voice => 
                voice.lang.startsWith('en') || 
                voice.lang.includes('English') ||
                voice.name.includes('English')
            );
            fallbackVoices = voices.filter(voice => 
                !voice.lang.startsWith('en') && !voice.lang.includes('English')
            );
        }
        
        // Add target language voices first
        targetVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voices.indexOf(voice);
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
        
        // Add fallback voices
        fallbackVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = voices.indexOf(voice);
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    // Load voices when available
    if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
    }
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    // Speak function
    function speakText(text) {
        if (!text.trim()) {
            alert('No text to speak');
            return;
        }

        // Stop any current speech
        speechSynthesis.cancel();

        currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Set voice if selected
        const selectedVoiceIndex = voiceSelect.value;
        if (selectedVoiceIndex && voices[selectedVoiceIndex]) {
            currentUtterance.voice = voices[selectedVoiceIndex];
        } else {
            // Try to find appropriate voice automatically based on target language
            let autoVoice = null;
            if (currentTargetLang === 'zh') {
                autoVoice = voices.find(voice => 
                    voice.lang.startsWith('zh') || voice.lang.includes('Chinese')
                );
            } else if (currentTargetLang === 'fil') {
                autoVoice = voices.find(voice => 
                    voice.lang.startsWith('fil') || voice.lang.startsWith('tl') ||
                    voice.lang.includes('Filipino') || voice.lang.includes('Tagalog')
                );
            } else if (currentTargetLang === 'en') {
                autoVoice = voices.find(voice => 
                    voice.lang.startsWith('en') || voice.lang.includes('English')
                );
            }
            if (autoVoice) {
                currentUtterance.voice = autoVoice;
            }
        }
        
        // Set properties
        currentUtterance.volume = parseFloat(volumeSlider.value);
        currentUtterance.rate = 0.9; // Slightly slower for better clarity
        currentUtterance.pitch = 1;

        // Event handlers
        currentUtterance.onstart = function() {
            speakBtn.disabled = true;
            stopBtn.disabled = false;
            speakBtn.textContent = '🔊 Speaking...';
        };

        currentUtterance.onend = function() {
            speakBtn.disabled = false;
            stopBtn.disabled = true;
            speakBtn.textContent = '🔊 Play Audio';
        };

        currentUtterance.onerror = function(event) {
            console.error('Speech synthesis error:', event);
            speakBtn.disabled = false;
            stopBtn.disabled = true;
            speakBtn.textContent = '🔊 Play Audio';
            alert('Speech synthesis failed. This may be due to browser limitations or missing voices.');
        };

        // Start speaking
        speechSynthesis.speak(currentUtterance);
    }

    // Stop speech function
    function stopSpeech() {
        speechSynthesis.cancel();
        speakBtn.disabled = false;
        stopBtn.disabled = true;
        speakBtn.textContent = '🔊 Play Audio';
    }

    // Event listeners for speech controls
    speakBtn.addEventListener('click', function() {
        const textToSpeak = translatedText.textContent.trim();
        if (textToSpeak && !textToSpeak.startsWith('Error:')) {
            speakText(textToSpeak);
        } else {
            alert('Please translate some text first');
        }
    });

    stopBtn.addEventListener('click', stopSpeech);
    
    // Language change handler
    targetLanguage.addEventListener('change', function() {
        currentTargetLang = targetLanguage.value;
        updateVoiceOptions();
        
        // Update button text
        const langName = targetLanguage.options[targetLanguage.selectedIndex].text;
        translateBtn.textContent = `Translate to ${langName}`;
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const text = inputText.value.trim();
        if (!text) {
            alert('Please enter some text to translate');
            return;
        }

        // Show loading state
        translateBtn.disabled = true;
        translateBtn.textContent = 'Translating...';
        resultDiv.classList.remove('show', 'error');
        
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text,
                    targetLanguage: currentTargetLang 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Translation failed');
            }

            // Show success result
            translatedText.textContent = data.translation;
            resultDiv.classList.add('show');
            resultDiv.classList.remove('error');

        } catch (error) {
            console.error('Error:', error);
            
            // Show error result
            translatedText.textContent = `Error: ${error.message}`;
            resultDiv.classList.add('show', 'error');
        } finally {
            // Reset button state
            translateBtn.disabled = false;
            const langName = targetLanguage.options[targetLanguage.selectedIndex].text;
            translateBtn.textContent = `Translate to ${langName}`;
        }
    });
});