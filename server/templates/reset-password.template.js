const resetEmailTemplate = (token) => {
  const baseUrl = process.env.SERVER_URL;

  return {
    body: {
      name: "User",
      intro:
        "You have received this email because a password reset request for your account was received.",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#22BC66",
          text: "Reset your password",
          link: `${baseUrl}/api/auth/reset-password/${token}`,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required on your part.",
    },
  };
};

export default resetEmailTemplate;
