import api from "../config/api";

const WebAPI = {
  getScheduleReportData: function(
    token,
    gymId,
    playerId,
    start,
    end,
    type,
    count_only,
    isChain,
    mode
  ) {
    const promise = api.get("/v2/stats?", {
      headers: {
        Authorization: token
      },
      params: {
        gym_id: gymId,
        identitetid: playerId,
        start,
        end,
        count_only,
        type,
        isChain,
        mode
      }
    });
    return promise;
  },

  getClassReportData: function(
    token,
    gymId,
    playerId,
    start,
    end,
    type,
    count_only,
    isChain,
    mode
  ) {
    const promise = api.get("/v2/stats?", {
      headers: {
        Authorization: token
      },
      params: {
        gym_id: gymId,
        identitetid: playerId,
        start,
        end,
        count_only,
        type,
        summed: 1,
        isChain,
        mode
      }
    });
    return promise;
  },

  getPlayers: function(gymId) {
    return api.get(`/v2/gyms/${gymId}/players`);
  },

  getSensors: function(gymId) {
    return api.get(`/v2/gyms/${gymId}/sensors`);
  }
};

export default WebAPI;
