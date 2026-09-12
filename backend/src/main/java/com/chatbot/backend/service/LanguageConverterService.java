package com.chatbot.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@Slf4j
public class LanguageConverterService implements LanguageConverter {

    /*
     * Hindi / Devanagari detection.
     */
    private static final Pattern HINDI_PATTERN = Pattern.compile("[\\u0900-\\u097F]");

    /*
     * Other Indian scripts.
     * Kept for future multilingual support.
     */
    private static final Pattern BENGALI_PATTERN = Pattern.compile("[\\u0980-\\u09FF]");

    private static final Pattern GUJARATI_PATTERN = Pattern.compile("[\\u0A80-\\u0AFF]");

    private static final Pattern PUNJABI_PATTERN = Pattern.compile("[\\u0A00-\\u0A7F]");

    private static final Pattern ODIA_PATTERN = Pattern.compile("[\\u0B00-\\u0B7F]");

    private static final Pattern TAMIL_PATTERN = Pattern.compile("[\\u0B80-\\u0BFF]");

    private static final Pattern TELUGU_PATTERN = Pattern.compile("[\\u0C00-\\u0C7F]");

    private static final Pattern KANNADA_PATTERN = Pattern.compile("[\\u0C80-\\u0CFF]");

    private static final Pattern MALAYALAM_PATTERN = Pattern.compile("[\\u0D00-\\u0D7F]");

    /*
     * Common Roman Hindi / Hinglish words.
     */
    private static final Set<String> HINGLISH_WORDS = new HashSet<>();

    static {

        String[] words = {
                "mujhe",
                "mujh",
                "mera",
                "meri",
                "mere",
                "hum",
                "ham",
                "hume",
                "humein",
                "aap",
                "ap",
                "aapko",
                "tum",
                "tumhe",
                "tera",
                "teri",
                "tere",

                "hai",
                "hain",
                "ho",
                "hoga",
                "hogi",
                "honge",

                "tha",
                "thi",
                "the",

                "kya",
                "kaise",
                "kaisa",
                "kaisi",
                "kyun",
                "kyu",

                "nahi",
                "nahin",

                "kar",
                "karo",
                "karna",
                "karta",
                "karte",
                "kartii",
                "raha",
                "rahi",
                "rahe",

                "mein",
                "main",
                "me",
                "se",
                "ko",
                "ke",
                "ka",
                "ki",
                "aur",
                "bhi",
                "bahut",

                "accha",
                "acha",
                "achha",
                "theek",
                "thik",

                "dard",
                "bukhar",
                "khansi",
                "sardi",
                "pet",
                "sir",
                "gala",
                "aankh",
                "pair",
                "haath",

                "dawai",
                "dawa",
                "doctor",
                "hospital",

                "saans",
                "chakkar",
                "ulti",
                "kamzori",
                "jalan",
                "sujan",
                "khoon",
                "neend"
        };

        for (String word : words) {
            HINGLISH_WORDS.add(word);
        }
    }

    /**
     * Detect the user's language.
     *
     * Supported primary languages:
     *
     * en = English
     * hi = Hindi
     * hinglish = Hindi written using Roman/English characters
     */
    @Override
    public String detectLanguage(String text) {

        if (text == null || text.trim().isEmpty()) {
            return "en";
        }

        String cleanedText = text.trim();

        /*
         * Devanagari = Hindi.
         */
        if (HINDI_PATTERN.matcher(cleanedText).find()) {
            return "hi";
        }

        /*
         * Other Indian scripts.
         */
        if (BENGALI_PATTERN.matcher(cleanedText).find()) {
            return "bn";
        }

        if (GUJARATI_PATTERN.matcher(cleanedText).find()) {
            return "gu";
        }

        if (PUNJABI_PATTERN.matcher(cleanedText).find()) {
            return "pa";
        }

        if (ODIA_PATTERN.matcher(cleanedText).find()) {
            return "or";
        }

        if (TAMIL_PATTERN.matcher(cleanedText).find()) {
            return "ta";
        }

        if (TELUGU_PATTERN.matcher(cleanedText).find()) {
            return "te";
        }

        if (KANNADA_PATTERN.matcher(cleanedText).find()) {
            return "kn";
        }

        if (MALAYALAM_PATTERN.matcher(cleanedText).find()) {
            return "ml";
        }

        /*
         * Roman Hindi / Hinglish.
         */
        if (looksLikeHinglish(cleanedText)) {
            return "hinglish";
        }

        /*
         * Default.
         */
        return "en";
    }

    /**
     * No external translation is performed.
     *
     * Groq understands Hindi, English and Hinglish directly.
     *
     * Keeping this method allows the existing application architecture
     * to continue working without Google Translate.
     */
    @Override
    public String translateToEnglish(String text, String language) {

        if (text == null || text.isBlank()) {
            return text;
        }

        /*
         * IMPORTANT:
         *
         * We intentionally return the original message.
         *
         * Hindi:
         * "मुझे बुखार है"
         *
         * Hinglish:
         * "mujhe bukhar hai"
         *
         * English:
         * "I have fever"
         *
         * All three are sent directly to Groq.
         */
        return text;
    }

    /**
     * No external translation is performed.
     *
     * Groq will generate the response in the user's language.
     */
    @Override
    public String translateFromEnglish(
            String response,
            String language) {

        if (response == null || response.isBlank()) {
            return response;
        }

        /*
         * Groq is now responsible for generating the response
         * in the correct language.
         */
        return response;
    }

    /**
     * Detect Roman Hindi / Hinglish.
     */
    private boolean looksLikeHinglish(String text) {

        String lower = text
                .toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", " ");

        String[] words = lower.split("\\s+");

        int matches = 0;

        for (String word : words) {

            if (HINGLISH_WORDS.contains(word)) {
                matches++;
            }
        }

        /*
         * Two or more Hindi words strongly suggests Hinglish.
         */
        if (matches >= 2) {
            return true;
        }

        /*
         * Some very common Hinglish phrases can contain only
         * one recognizable Hindi word.
         */
        return lower.contains("mujhe ")
                || lower.contains("mera ")
                || lower.contains("meri ")
                || lower.contains("mujh ")
                || lower.contains("kya ")
                || lower.contains("kaise ")
                || lower.contains("kyun ")
                || lower.contains("nahi ")
                || lower.contains("bukhar ")
                || lower.contains("dard ")
                || lower.contains("dawai ");
    }

    /**
     * Helper method for logging/debugging.
     */
    public boolean isSupportedLanguage(String language) {

        if (language == null) {
            return false;
        }

        return language.equalsIgnoreCase("en")
                || language.equalsIgnoreCase("hi")
                || language.equalsIgnoreCase("hinglish");
    }
}