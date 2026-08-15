package domain

import "strings"

var skillAliases = map[string]string{
	"golang":        "Go",
	"go":            "Go",
	"postgres":      "PostgreSQL",
	"postgresql":    "PostgreSQL",
	"psql":          "PostgreSQL",
	"k8s":           "Kubernetes",
	"kubernetes":    "Kubernetes",
	"js":            "JavaScript",
	"javascript":    "JavaScript",
	"ts":            "TypeScript",
	"typescript":    "TypeScript",
	"reactjs":       "React",
	"react.js":      "React",
	"react":         "React",
	"nodejs":        "Node.js",
	"node":          "Node.js",
	"node.js":       "Node.js",
	"nextjs":        "Next.js",
	"next.js":       "Next.js",
	"py":            "Python",
	"python":        "Python",
	"rustlang":      "Rust",
	"rust":          "Rust",
	"aws":           "AWS",
	"gcp":           "GCP",
	"tf":            "Terraform",
	"terraform":     "Terraform",
	"docker":        "Docker",
	"redis":         "Redis",
	"kafka":         "Kafka",
	"graphql":       "GraphQL",
	"grpc":          "gRPC",
	"mysql":         "MySQL",
	"mongo":         "MongoDB",
	"mongodb":       "MongoDB",
	"elasticsearch": "Elasticsearch",
	"tailwind":      "Tailwind CSS",
	"tailwindcss":   "Tailwind CSS",
}

func CanonicalSkill(name string) string {
	key := strings.ToLower(strings.TrimSpace(name))

	if canonical, ok := skillAliases[key]; ok {
		return canonical
	}

	return strings.TrimSpace(name)
}
