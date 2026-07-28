import { CommonCalibreBallisticsChart } from "@/components/blog/ballistics-chart";

export const ballisticsChartToken = "[pros-ballistics-chart]";

type BlogArticleBodyProps = {
  body: string | null;
};

function TextBlock({ children }: { children: string }) {
  if (!children.trim()) {
    return null;
  }

  return (
    <div className="whitespace-pre-line text-base leading-8 text-forest-900/78">
      {children.trim()}
    </div>
  );
}

export function hasBallisticsChart(body: string | null) {
  return (body ?? "").includes(ballisticsChartToken);
}

export function BlogArticleBody({ body }: BlogArticleBodyProps) {
  const content = body ?? "This article does not have body content yet.";

  if (!content.includes(ballisticsChartToken)) {
    return <TextBlock>{content}</TextBlock>;
  }

  const parts = content.split(ballisticsChartToken);

  return (
    <div className="grid gap-8">
      {parts.map((part, index) => (
        <div key={`${index}-${part.slice(0, 12)}`}>
          <TextBlock>{part}</TextBlock>
          {index < parts.length - 1 ? (
            <div className="mt-8">
              <CommonCalibreBallisticsChart />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
