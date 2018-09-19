import api from '../config/api';

const WebAPI = {

    getScheduleReportData: function (token, gymId, playerId, start, end, type, count_only, isChain) {
        const promise = api.get('/v2/stats?', {
            headers: {
                "Authorization": token,
            },
            params: {
                gym_id: gymId,
                identitetid: playerId,
                start,
                end,
                count_only,
                type,
                isChain
            }
        });
        return promise;
    },

    getClassReportData: function (token, gymId, playerId, start, end, type, count_only, isChain) {
        const promise = api.get('/v2/stats?', {
            headers: {
                "Authorization": token,
            },
            params: {
                gym_id: gymId,
                identitetid: playerId,
                start,
                end,
                count_only,
                type,
                summed: 1,
                isChain
            }
        });
        return promise;
    },

    getPlayers: function (gymId) {
        return api.get(`/v2/gyms/${gymId}/players`);
    },

    getSensors: function (gymId) {
        return api.get(`/v2/gyms/${gymId}/sensors`);
    }
}

export default WebAPI;
