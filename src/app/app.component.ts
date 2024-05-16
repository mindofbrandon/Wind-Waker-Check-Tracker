import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { CommonModule } from '@angular/common';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';
import {MatExpansionModule} from '@angular/material/expansion';

interface Item {
  name: string;
  completed: boolean;
}

interface Location {
  [location: string]: Item[];
}

interface GroupedLines {
  cannotProgress: Location;
  mayOrMayNotProgress: Location;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatCardModule, CommonModule, MatCheckboxModule, FormsModule, MatExpansionModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {

  title = 'Wind-Waker-Check-Tracker';
  fileContent: string = "";
  allComplete: boolean = false;
  groupedLines: GroupedLines | null = null;
  sections: (keyof GroupedLines)[] = ['cannotProgress', 'mayOrMayNotProgress'];

  ngOnInit(): void {
    const storedData = localStorage.getItem('groupedLines');
    if (storedData) {
      this.groupedLines = JSON.parse(storedData);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = (e.target as FileReader).result as string;
        this.groupedLines = this.groupLinesBySection(fileContent);
        localStorage.setItem('groupedLines', JSON.stringify(this.groupedLines));
      };
      reader.readAsText(file);
    }
  }

  toggleCompletion(section: keyof GroupedLines, location: string, index: number): void {
    if (this.groupedLines) {
      this.groupedLines[section][location][index].completed = !this.groupedLines[section][location][index].completed;
      localStorage.setItem('groupedLines', JSON.stringify(this.groupedLines));
    }
  }

  groupLinesBySection(fileContent: string): GroupedLines {
    const lines = fileContent.split('\n');
    const groupedLines: GroupedLines = { cannotProgress: {}, mayOrMayNotProgress: {} };
    let currentSection: keyof GroupedLines | null = null;
    let currentLocation: string | null = null;
    let skipCount = 0;
    lines.forEach(line => {
      // Trim leading and trailing whitespace from the line
      line = line.trim();

      if (line.startsWith('### Locations that cannot have progress items in them on this run:')) {
        currentSection = 'cannotProgress';
        return;
      }

      if (line.startsWith('### Locations that may or may not have progress items in them on this run:')) {
        currentSection = 'mayOrMayNotProgress';
        return;
      }

      if (line === '') {
        return; // Skip empty lines
      }

      // skip the header of the spoiler log
      if (skipCount < 6) {
        skipCount++;
        return;
      }

      if (line.endsWith(':')) {
        // Extract location name from line and set as current location
        currentLocation = line.slice(0, -1).trim();
        groupedLines[currentSection as keyof GroupedLines][currentLocation] = [];
      } else if (currentLocation !== null) {
        // Add line to corresponding location
        groupedLines[currentSection as keyof GroupedLines][currentLocation].push({ name: line, completed: false });
      }
    });

    return groupedLines;
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Parse the file content and group lines by section
  processFile() {
    // Process the file content here (optional)
    this.groupedLines = this.groupLinesBySection(this.fileContent);
    console.log(this.groupedLines);
    
  }
}
