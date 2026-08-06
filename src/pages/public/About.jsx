import React from 'react';
import { StaticPage } from '../../components/ui/StaticPage';

export default function About() {
  return (
    <StaticPage
      eyebrow="About"
      title="Built for the classroom, engineered for scale."
      description="UniCodeIDE was founded by a team of former CS professors and platform engineers to fix the broken tooling of programming education."
    >
      <p className="text-muted-foreground">Traditional programming classrooms burn a third of every lecture on installs and version conflicts. We built UniCodeIDE to reclaim that time — with a browser-first IDE, an integrated LMS and secure exam infrastructure that just works.</p>
      <h3 className="mt-8 text-xl font-medium tracking-tight text-foreground">Our mission</h3>
      <p className="text-muted-foreground">Give every CS student on Earth a professional-grade development environment — starting from lesson one.</p>
      <h3 className="mt-8 text-xl font-medium tracking-tight text-foreground">The team</h3>
      <p className="text-muted-foreground">A distributed team of educators, engineers and designers across 4 continents. We've shipped platforms for GitHub, Vercel, JetBrains and Coursera.</p>
    </StaticPage>
  );
}
