package chat

import (
	"fmt"
	"strings"

	"github.com/octane/entwine/server/internal/domain"
)

const mainOpening = `I'm Ellie. I help engineers across India and South-East Asia find their next role.

Start by sharing your resume as a PDF, up to 8MB. I'll read it and fill in your experience, education and skills under **Profile**, so you never have to type any of that out.

Any job I find turns up here as a card. Open one and it gets its own chat, where you ask me about that job and keep track of where you've reached: applied, interviewing, and so on. This chat stays the main one.

Whenever you're ready, tell me what you're looking for.`

const coachingOpening = `We'll run this as practice: **%s**.

I'll play the other side and stay in role. After each answer, I'll break for one short note on what to change, then we pick up where we left off.

Join the call to practise more interactively, or keep typing if you'd rather. If I need something before we start, such as the offer or your current salary, I'll ask for it first.`

const jobPostOpening = `We'll run this as practice: **%s**.

Paste the job description below. The whole posting is fine, and I'll build the interview around that exact role.

Join the call once we start and you can answer out loud, which is closer to the real thing.

I'll play the interviewer and stay in role. After each answer, I'll break for one short note on what to change, then we carry on.`

var jobPostScenarios = map[string]bool{"from-post": true, "mock": true}

func openingMessage(kind domain.ThreadKind, title, scenario string) string {
	if kind != domain.ThreadKindCoaching {
		return mainOpening
	}

	name := strings.TrimSpace(title)
	if name == "" {
		name = "a session you choose"
	}

	if jobPostScenarios[scenario] {
		return fmt.Sprintf(jobPostOpening, name)
	}

	return fmt.Sprintf(coachingOpening, name)
}
