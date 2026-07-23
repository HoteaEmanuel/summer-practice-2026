type SaveSessionProps = {
  access_token: string;
  role: string;
  group: string;
  name?: string;
  loggedinUser?: string;
  username?: string;
};
export const saveSession = ({
  access_token,
  group,
  role,
  loggedinUser,
  name,
  username,
}: SaveSessionProps) => {
  sessionStorage.setItem("access_token", access_token);
  sessionStorage.setItem("role", role || "");
  sessionStorage.setItem("group", group || "");
  sessionStorage.setItem("name", name || loggedinUser || username || "");
  sessionStorage.setItem("username", username || loggedinUser || "");
};

export const getSession = () => {
  const access_token = sessionStorage.getItem("access_token");
  const role = sessionStorage.getItem("role");
  const group = sessionStorage.getItem("group");
  const name = sessionStorage.getItem("name");
  const username = sessionStorage.getItem("username");

  return { access_token, role, group, name, username };
};
