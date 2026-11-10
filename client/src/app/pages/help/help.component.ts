import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
})
export class HelpComponent {
  steps = [
    { title: 'Create an account', text: 'Click Login / Register to create an account. You need to be logged in to save designs.' },
    { title: 'Upload a room photo', text: 'In the Studio, choose a clear JPG or PNG photo of your room (max 5 MB). Upload only your own photos.' },
    { title: 'Select a wall', text: 'Click the corners of a wall one by one. Click the first (green) point again to close the wall. Use Undo point if you make a mistake.' },
    { title: 'Choose a colour', text: 'Pick a colour from the category dropdown or use the custom colour picker. Use the opacity slider to make the colour lighter or deeper.' },
    { title: 'Paint another wall', text: 'Select another wall and apply a different colour for a dual-tone look. Click any wall in the "My walls" list to change its colour.' },
    { title: 'Compare before and after', text: 'Click the Before / After slider and drag on the canvas. The left side shows the original, the right side shows the painted room.' },
    { title: 'Save or download', text: 'Save design stores it in My Designs. Download image gives you a PNG file. You can edit a saved design later.' },
  ];

  tips = [
    'A clear photo taken in daylight gives the best result.',
    'Click carefully along the wall edges and keep furniture outside the selection.',
    'Use higher opacity for dark colours and lower opacity for light colours.',
  ];
}