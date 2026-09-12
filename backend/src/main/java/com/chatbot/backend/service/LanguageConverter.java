package com.chatbot.backend.service;

/**
 * Handles language detection and translation for Emma.
 *
 * Flow:
 *
 * User message
 * ↓
 * Detect language
 * ↓
 * Translate to English
 * ↓
 * Groq
 * ↓
 * Translate response back
 * ↓
 * User
 */
public interface LanguageConverter {

    /**
     * Detect the user's language.
     *
     * Possible values:
     * en = English
     * hi = Hindi
     * hinglish = Roman Hindi + English
     * bn = Bengali
     * ta = Tamil
     * te = Telugu
     * mr = Marathi
     * gu = Gujarati
     * kn = Kannada
     * ml = Malayalam
     * pa = Punjabi
     * or = Odia
     *
     * @param text user's message
     * @return detected language code
     */
    String detectLanguage(String text);

    /**
     * Translate user's message to English.
     *
     * @param text     original user message
     * @param language detected language
     * @return English text
     */
    String translateToEnglish(String text, String language);

    /**
     * Translate Emma's English response back to
     * the language used by the user.
     *
     * @param englishText Emma's English response
     * @param language user's original language
     * @return translated response
     */
    String translateFromEnglish(
            String englishText,
            String language);
}