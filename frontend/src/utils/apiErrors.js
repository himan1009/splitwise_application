export function getApiErrorMessage(err, fallback = "Something went wrong") {
  if (err?.code === "ECONNABORTED") {
    return "Server is waking up — free databases can take up to a minute. Please wait and try again.";
  }
  if (!err?.response) {
    return "Cannot reach server. Check your internet or try again in a moment.";
  }
  return err.response?.data?.message || fallback;
}
