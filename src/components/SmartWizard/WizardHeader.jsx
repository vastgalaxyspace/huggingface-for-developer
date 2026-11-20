import StepIndicator from "./StepIndicator";

export default function WizardHeader(props) {
  return <header className="wizard-heading">
    <h1>Model recommender</h1>
    <p>Match your task, hardware, and performance priorities to a shortlist.</p>
    <StepIndicator {...props} />
  </header>;
}
