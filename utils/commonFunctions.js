export const formatErrors = (error) => {
  let errors = {};
  error.errors?.map((issue) => {
    errors[issue.path?.[0]] = issue.message;
  });
  return errors;
};

export const sanitize = (value) => {
  if (typeof value === "string") {
    return value.trim() || null;
  }
  return null;
};
