
import { useState } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';

const GameInstructions = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className={`${expanded ? 'mb-4' : 'mb-2'} mx-auto max-w-md overflow-hidden`}>
      <Accordion 
        type="single" 
        collapsible 
        onValueChange={(value) => setExpanded(!!value)}
      >
        <AccordionItem value="instructions">
          <AccordionTrigger className="px-4 py-2">
            How to Play
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the map to locate nearby treasures (gold dots) and obstacles (colored dots).</li>
              <li>Move physically closer to treasures and obstacles (within 30 meters).</li>
              <li>Use the AR camera to find and collect treasures in the real world.</li>
              <li>Clear obstacles that block your path to treasures.</li>
              <li>Collect rare treasures for more points!</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default GameInstructions;
