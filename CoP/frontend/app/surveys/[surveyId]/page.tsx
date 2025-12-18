import SurveyPageClient from "@/components/surveys/SurveyPageClient";

export default function SurveyPage({
  params
}: {
  params: { surveyId: string };
}) {
  return <SurveyPageClient surveyId={params.surveyId} />;
}


