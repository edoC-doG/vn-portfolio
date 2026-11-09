import { getDict } from '@/content';
import { Credits, Hud, Rail, TopBar } from '@/components/journey/chrome';
import { Panels } from '@/components/journey/panels';
import { JourneyScene } from '@/components/journey/scene';
import './journey.css';

// The 3D journey. The server renders every panel in the route's language (so the content is readable and indexable
// without WebGL); the engine then flies the camera and fades the panels as the visitor scrolls the #track.
export default async function JourneyPage() {
  const d = await getDict();
  return (
    <>
      <canvas id="gl" aria-label={d.meta.ogAlt} />
      <div id="labels" aria-hidden="true" />
      <Credits d={d} />
      <TopBar d={d} />
      <Hud d={d} />
      <Panels d={d} />
      <Rail d={d} />
      <div id="track" aria-hidden="true" />
      <JourneyScene />
    </>
  );
}
