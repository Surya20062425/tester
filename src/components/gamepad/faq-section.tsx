'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Why is my controller not detected?',
    a: 'Make sure your controller is connected via USB or Bluetooth and recognized by your operating system. Some browsers require you to press a button on the controller after connecting to activate the Gamepad API. Try pressing any button while this page is open. Also, ensure the page has focus (click on it) and is not in a background tab.',
  },
  {
    q: 'Why do some buttons or axes show unexpected values?',
    a: 'Not all controllers use the "standard" mapping. If the mapping field shows as empty or "nonstandard", the browser does not know which axis or button corresponds to which physical control. The raw data is still displayed accurately — you just need to identify which button/axis maps to which control manually.',
  },
  {
    q: 'Why is my analog stick not perfectly centered at 0.000?',
    a: 'Small offsets from zero (e.g., 0.004 or -0.008) are normal and caused by mechanical tolerances in the analog stick hardware. If the offset is large (e.g., > 0.05 when the stick is released), this may indicate stick drift — a common hardware issue. Use the Circularity Test to diagnose this further.',
  },
  {
    q: 'What is stick drift?',
    a: 'Stick drift occurs when an analog stick registers input even when it is not being touched. This is typically caused by wear, dust, or debris in the stick mechanism. The Circularity Test can help quantify the issue by showing whether the stick traces a consistent circle and whether it returns to center.',
  },
  {
    q: 'Why does vibration not work?',
    a: 'Vibration support depends on both the browser and the controller. Many browsers only implement the "dual-rumble" vibration effect. Some controllers do not expose haptic actuators through the browser API. Additionally, some browsers require a user gesture before allowing vibration. If the Vibration section shows "Not Available", your browser or controller does not support this feature.',
  },
  {
    q: 'Why does the timestamp keep changing?',
    a: 'The timestamp is a high-resolution timer value provided by the browser that indicates when the gamepad state was last updated. It changes continuously as the controller sends data. This is normal behavior — the value itself is not meaningful for diagnostics, but it confirms the controller is actively reporting state.',
  },
  {
    q: 'How many controllers can I test at once?',
    a: 'The Gamepad API supports up to 4 connected controllers simultaneously in most browsers. Each controller gets its own independent panel with live data. Connect additional controllers and they will appear automatically.',
  },
  {
    q: 'Which browsers support the Gamepad API?',
    a: 'All modern browsers support the Gamepad API, including Chrome, Edge, Firefox, Safari (16.4+), and Opera. However, feature support varies — for example, vibration may not work in all browsers, and some browsers report different metadata for the same controller.',
  },
  {
    q: 'Can I use this with a steering wheel, flight stick, or other non-gamepad device?',
    a: 'Yes! Any device that exposes itself through the browser\'s Gamepad API will be detected. This includes racing wheels, flight sticks, pedals, and other HID devices. The raw axis and button data will be displayed even if the device does not use the standard gamepad mapping.',
  },
];

export function FaqSection() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          FAQ & Help
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-sm text-left">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
