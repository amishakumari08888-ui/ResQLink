package com.chatbot.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String specialty;

    private String subSpecialty;

    private int experienceYears;

    @Column(nullable = false)
    private String hospitalLocation;

    private String contactNumber;

    private String email;

    private double rating;

    private String consultationFee;

    private String availableDays;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "doctor_symptoms", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "symptom")
    private List<String> symptomsHandled;

    public Doctor(String name, String specialty, String subSpecialty, int experienceYears,
                  String hospitalLocation, String contactNumber, String email,
                  double rating, String consultationFee, String availableDays,
                  List<String> symptomsHandled) {
        this.name = name;
        this.specialty = specialty;
        this.subSpecialty = subSpecialty;
        this.experienceYears = experienceYears;
        this.hospitalLocation = hospitalLocation;
        this.contactNumber = contactNumber;
        this.email = email;
        this.rating = rating;
        this.consultationFee = consultationFee;
        this.availableDays = availableDays;
        this.symptomsHandled = symptomsHandled;
    }
}
