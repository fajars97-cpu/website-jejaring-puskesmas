export function getUserLabel(user) {
  const email = user?.email || "";
  if (!email) return "User";
  return email.split("@")[0];
}
