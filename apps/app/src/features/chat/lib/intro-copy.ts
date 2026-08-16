interface IntroCopy {
  eyebrow: string;
  title: string;
}

export const introCopy = (isCoaching: boolean, name: string, topic: string): IntroCopy => {
  if (isCoaching) {
    return { eyebrow: "Practice session", title: topic === "" ? "Let's practise" : topic };
  }

  return {
    eyebrow: name === "" ? "Hey there" : `Hey ${name}`,
    title: "Share your resume or your stack. I'll find the roles.",
  };
};
