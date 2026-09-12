package com.chatbot.backend.repository;

import com.chatbot.backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findBySpecialtyIgnoreCase(String specialty);

    @Query("SELECT DISTINCT d FROM Doctor d WHERE LOWER(d.specialty) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.subSpecialty) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Doctor> searchDoctors(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT d FROM Doctor d JOIN d.symptomsHandled s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :symptom, '%'))")
    List<Doctor> findBySymptom(@Param("symptom") String symptom);
}
