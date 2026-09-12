package com.chatbot.backend.service;

import com.chatbot.backend.entity.Doctor;
import com.chatbot.backend.repository.DoctorRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @PostConstruct
    public void initDoctorDatabase() {
        if (doctorRepository.count() == 0) {
            log.info("Seeding initial Doctor Database...");

            List<Doctor> seedDoctors = Arrays.asList(
                // General Medicine / Internal Medicine
                new Doctor("Dr. Sarah Jenkins", "General Physician", "Internal Medicine", 14,
                        "Nexcure Care Clinic, Central Wing", "+1-800-555-0101", "dr.jenkins@nexcure.org",
                        4.9, "$60", "Mon-Fri (8:00 AM - 4:00 PM)",
                        Arrays.asList("fever", "cough", "fatigue", "flu", "headache", "cold", "general body pain", "infection")),

                new Doctor("Dr. Rajesh Sharma", "General Physician", "Family Medicine", 18,
                        "City Healthcare Center", "+1-800-555-0102", "dr.sharma@nexcure.org",
                        4.8, "$55", "Mon-Sat (9:00 AM - 5:00 PM)",
                        Arrays.asList("fever", "hypertension", "diabetes", "stomach pain", "vomiting", "weakness", "chills")),

                // Cardiology
                new Doctor("Dr. Elena Rostova", "Cardiologist", "Interventional Cardiology", 16,
                        "Heart & Vascular Institute", "+1-800-555-0201", "dr.rostova@nexcure.org",
                        4.95, "$120", "Mon, Wed, Fri (9:00 AM - 2:00 PM)",
                        Arrays.asList("chest pain", "heart palpitations", "shortness of breath", "high blood pressure", "arrhythmia", "cardiac risk")),

                new Doctor("Dr. Marcus Vance", "Cardiologist", "Electrophysiology", 12,
                        "Metropolitan Heart Center", "+1-800-555-0202", "dr.vance@nexcure.org",
                        4.85, "$115", "Tue, Thu, Sat (10:00 AM - 4:00 PM)",
                        Arrays.asList("chest tightness", "irregular heartbeat", "dizziness", "hypertension", "chest pressure")),

                // Dermatology
                new Doctor("Dr. Anita Patel", "Dermatologist", "Clinical & Cosmetic Dermatology", 10,
                        "Skin & Laser Care Hub", "+1-800-555-0301", "dr.patel@nexcure.org",
                        4.9, "$80", "Mon-Thu (10:00 AM - 6:00 PM)",
                        Arrays.asList("skin rash", "acne", "eczema", "psoriasis", "hives", "itching", "skin allergy", "scalp irritation")),

                new Doctor("Dr. David Kim", "Dermatologist", "Pediatric Dermatology", 15,
                        "Apex Skin Clinic", "+1-800-555-0302", "dr.kim@nexcure.org",
                        4.88, "$85", "Wed-Sat (11:00 AM - 5:00 PM)",
                        Arrays.asList("rash", "fungal infection", "skin redness", "dermatitis", "mole examination", "blisters")),

                // Neurology
                new Doctor("Dr. Robert Chen", "Neurologist", "Headache & Stroke Specialist", 20,
                        "Brain & Neurological Institute", "+1-800-555-0401", "dr.chen@nexcure.org",
                        4.92, "$130", "Mon-Thu (9:00 AM - 3:00 PM)",
                        Arrays.asList("migraine", "severe headache", "numbness", "seizures", "tremors", "memory loss", "dizziness", "nerve pain")),

                // Orthopedics
                new Doctor("Dr. Sophia Martinez", "Orthopedist", "Joint & Sports Injuries", 13,
                        "Orthopedic & Spine Center", "+1-800-555-0501", "dr.martinez@nexcure.org",
                        4.89, "$95", "Mon-Fri (9:00 AM - 5:00 PM)",
                        Arrays.asList("joint pain", "knee pain", "back pain", "fracture", "arthritis", "shoulder strain", "ligament tear")),

                // Gastroenterology
                new Doctor("Dr. Vikram Malhotra", "Gastroenterologist", "Hepatology & Digestive Health", 15,
                        "Digestive Health Center", "+1-800-555-0601", "dr.malhotra@nexcure.org",
                        4.91, "$100", "Tue-Sat (8:30 AM - 3:30 PM)",
                        Arrays.asList("acidity", "acid reflux", "stomach ulcer", "bloating", "severe abdominal pain", "diarrhea", "jaundice", "nausea")),

                // Pulmonology
                new Doctor("Dr. Emily Watson", "Pulmonologist", "Respiratory & Asthma Care", 11,
                        "Pulmonary Health Clinic", "+1-800-555-0701", "dr.watson@nexcure.org",
                        4.87, "$90", "Mon-Fri (10:00 AM - 4:00 PM)",
                        Arrays.asList("chronic cough", "asthma", "bronchitis", "wheezing", "shortness of breath", "chest congestion", "pneumonia")),

                // ENT (Otolaryngology)
                new Doctor("Dr. Jonathan Taylor", "ENT Specialist", "Otolaryngology", 14,
                        "Head & Neck Care Clinic", "+1-800-555-0801", "dr.taylor@nexcure.org",
                        4.86, "$75", "Mon-Sat (9:30 AM - 4:30 PM)",
                        Arrays.asList("ear pain", "sore throat", "sinusitis", "nasal congestion", "tonsillitis", "hearing difficulty", "tinnitus")),

                // Psychiatry / Mental Health
                new Doctor("Dr. Maya Lin", "Psychiatrist", "Behavioral & Mental Health", 12,
                        "Mind & Wellness Sanctuary", "+1-800-555-0901", "dr.lin@nexcure.org",
                        4.94, "$110", "Mon-Fri (11:00 AM - 7:00 PM)",
                        Arrays.asList("anxiety", "depression", "insomnia", "panic attack", "stress", "mood swings", "burnout"))
            );

            doctorRepository.saveAll(seedDoctors);
            log.info("Successfully seeded {} doctors into Doctor Database.", seedDoctors.size());
        }
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        if (specialty == null || specialty.isBlank()) return Collections.emptyList();
        return doctorRepository.findBySpecialtyIgnoreCase(specialty.trim());
    }

    public List<Doctor> searchDoctors(String keyword) {
        if (keyword == null || keyword.isBlank()) return getAllDoctors();
        return doctorRepository.searchDoctors(keyword.trim());
    }

    public List<Doctor> findDoctorsForSymptoms(String symptomText) {
        if (symptomText == null || symptomText.isBlank()) {
            return Collections.emptyList();
        }

        String textLower = symptomText.toLowerCase();
        List<Doctor> allDoctors = doctorRepository.findAll();
        
        // Score doctors based on matched symptoms or specialty
        Map<Doctor, Integer> scoredDoctors = new HashMap<>();

        for (Doctor doc : allDoctors) {
            int score = 0;

            // Specialty match
            if (textLower.contains(doc.getSpecialty().toLowerCase())) {
                score += 10;
            }
            if (doc.getSubSpecialty() != null && textLower.contains(doc.getSubSpecialty().toLowerCase())) {
                score += 8;
            }

            // Symptom match
            if (doc.getSymptomsHandled() != null) {
                for (String symptom : doc.getSymptomsHandled()) {
                    if (textLower.contains(symptom.toLowerCase())) {
                        score += 5;
                    }
                }
            }

            if (score > 0) {
                scoredDoctors.put(doc, score);
            }
        }

        // Return top matched doctors sorted by score descending
        return scoredDoctors.entrySet().stream()
                .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .limit(3)
                .collect(Collectors.toList());
    }

    public String formatDoctorDatabaseSummary() {
        List<Doctor> doctors = getAllDoctors();
        StringBuilder sb = new StringBuilder();
        sb.append("NEXCURE VERIFIED DOCTOR DATABASE:\n");
        for (Doctor doc : doctors) {
            sb.append("- Doctor: ").append(doc.getName())
              .append(" | Specialty: ").append(doc.getSpecialty()).append(" (").append(doc.getSubSpecialty()).append(")")
              .append(" | Exp: ").append(doc.getExperienceYears()).append(" yrs")
              .append(" | Location: ").append(doc.getHospitalLocation())
              .append(" | Contact: ").append(doc.getContactNumber())
              .append(" | Fee: ").append(doc.getConsultationFee())
              .append(" | Hours: ").append(doc.getAvailableDays())
              .append(" | Symptoms: ").append(String.join(", ", doc.getSymptomsHandled()))
              .append("\n");
        }
        return sb.toString();
    }
}
