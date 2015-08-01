package com.exadel.repository;

import com.exadel.model.entity.training.Training;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Transactional
public interface TrainingRepository extends JpaRepository<Training, Long> {
   /* @Query( value = "select trainings.trainer_id from trainings where trainings.id = ?1")
    Optional<Long> findTrainerIdByTrainingId(long id);

    @Query("select training_users.user_id FROM training_users where training_users.training_id=?1")
    List<Long> findParticipantsByTrainingId(long id);*/
}
