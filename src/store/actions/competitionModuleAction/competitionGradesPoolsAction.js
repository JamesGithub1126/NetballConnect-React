import ApiConstants from '../../../themes/apiConstants';

function updateCompetitionGradePoolsAction(data, key, gradePoolId) {
    return {
        type: ApiConstants.UPDATE_COMPETITION_GRADES_POOLS,
        updatedData: data,
        key,
        gradePoolId
    };
}

export {
    updateCompetitionGradePoolsAction
}
