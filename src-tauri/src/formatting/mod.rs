// Formatting module - Text post-processing and voice commands

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TranscriptionMode {
    Lightning,  // Raw transcription
    Formatted,  // Apply punctuation and voice commands
}

pub struct FormattingEngine {
    mode: TranscriptionMode,
}

impl FormattingEngine {
    pub fn new(mode: TranscriptionMode) -> Self {
        Self { mode }
    }
    
    pub fn format(&self, text: &str) -> String {
        match self.mode {
            TranscriptionMode::Lightning => text.to_string(),
            TranscriptionMode::Formatted => self.apply_formatting(text),
        }
    }
    
    fn apply_formatting(&self, text: &str) -> String {
        let mut result = text.to_string();
        
        // Apply voice commands
        result = result.replace(" new line", "\n");
        result = result.replace(" comma", ",");
        result = result.replace(" period", ".");
        result = result.replace(" question mark", "?");
        result = result.replace(" exclamation point", "!");
        
        // Capitalize first letter
        if let Some(first_char) = result.chars().next() {
            if first_char.is_lowercase() {
                result = first_char.to_uppercase().collect::<String>() + &result[1..];
            }
        }
        
        // Collapse multiple spaces
        while result.contains("  ") {
            result = result.replace("  ", " ");
        }
        
        // Add period at end if missing punctuation
        let last_char = result.chars().last();
        if let Some(c) = last_char {
            if !matches!(c, '.' | '!' | '?') {
                result.push('.');
            }
        }
        
        result
    }
    
    pub fn set_mode(&mut self, mode: TranscriptionMode) {
        self.mode = mode;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_lightning_mode() {
        let engine = FormattingEngine::new(TranscriptionMode::Lightning);
        let result = engine.format("hello world");
        assert_eq!(result, "hello world");
    }
    
    #[test]
    fn test_formatted_mode() {
        let engine = FormattingEngine::new(TranscriptionMode::Formatted);
        let result = engine.format("hello world");
        assert_eq!(result, "Hello world.");
    }
    
    #[test]
    fn test_voice_commands() {
        let engine = FormattingEngine::new(TranscriptionMode::Formatted);
        let result = engine.format("hello comma world period this is a test");
        assert_eq!(result, "Hello, world. this is a test.");
    }
}
