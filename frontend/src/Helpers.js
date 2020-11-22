module.exports = {
  getErrorFromResponse: (e) =>
    e.response?.data?.message || e?.message || "System received unknown error!",
};
