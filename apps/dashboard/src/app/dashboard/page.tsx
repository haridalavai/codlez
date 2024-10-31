"use client";
import { useAuth } from "@clerk/nextjs";
import React, { useEffect } from "react";

const Dashboard = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    gett();
  }, []);

  async function gett() {
    const token = await getToken({
      template: "codlez_template",
    });
    console.log(token);
  }
  return <div>Dashboard</div>;
};

export default Dashboard;
