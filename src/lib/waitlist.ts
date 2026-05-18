const fallbackMessage = "Something went wrong. Please try again.";

type JoinWaitlistResponse =
  | {
      ok: true;
    }
  | {
      error: string;
    };

export async function joinWaitlist(email: string) {
  const response = await fetch("/api/interested", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const payload = (await response
    .json()
    .catch(() => null)) as JoinWaitlistResponse | null;

  if (!response.ok) {
    throw new Error(
      payload && "error" in payload && payload.error
        ? payload.error
        : fallbackMessage,
    );
  }

  return payload;
}
