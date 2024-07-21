import React from "react";
import { useQuery, gql } from "@apollo/client";
import Graphs from "./Graphs/Graphs";
import "./MainPage.css";

const GET_USER_DATA = gql`
  query GetUserData {
    user {
      id
      login
      email
    }
  }
`;

const MainPage: React.FC<{ token: string }> = ({ token }) => {
  const { loading, error, data } = useQuery(GET_USER_DATA, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const user = data.user[0];

  return (
    <div className="main-page">
      <h1>Welcome, {user.login}</h1>
      <p>User ID: {user.id}</p>
      <p>Email: {user.email}</p>
      <Graphs userId={user.id} />
    </div>
  );
};

export default MainPage;
