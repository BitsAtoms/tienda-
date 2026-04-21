/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AssetTemplate } from './types';

export const ASSET_TEMPLATES: AssetTemplate[] = [
  {
    id: 'screen-vertical',
    name: 'Samsung Vertical LED',
    type: 'screen',
    width: 2,
    height: 1,
    depth: 4,
    color: '#1a1a1a', // Matt black frame
    icon: 'Monitor',
  },
  {
    id: 'screen-horizontal',
    name: 'Panoramic Wall Screen',
    type: 'screen',
    width: 4,
    height: 1,
    depth: 2,
    color: '#0f172a',
    icon: 'MonitorPlay',
  },
  {
    id: 'arcade-alien',
    name: 'Retro Arcade (Neon Green)',
    type: 'arcade',
    width: 2,
    height: 2,
    depth: 4,
    color: '#1e1e1e',
    icon: 'Gamepad2',
  },
  {
    id: 'arcade-starwars',
    name: 'Retro Arcade (Cyber Orange)',
    type: 'arcade',
    width: 2,
    height: 2,
    depth: 4,
    color: '#1e1e1e',
    icon: 'Gamepad2',
  },
  {
    id: 'shelf-long',
    name: 'Modular Shoe Rack',
    type: 'shelf',
    width: 6,
    height: 1,
    depth: 7,
    color: '#f3f4f6', // Light grey technical finish
    icon: 'Database',
  },
  {
    id: 'pedestal',
    name: 'Holographic Podium',
    type: 'stand',
    width: 1,
    height: 1,
    depth: 2,
    color: '#ffffff',
    icon: 'Box',
  },
  {
    id: 'entrance-door',
    name: 'Smart Glass Portal',
    type: 'door',
    width: 6,
    height: 1,
    depth: 6,
    color: '#e2e8f0',
    icon: 'DoorOpen',
  }
];

export const INITIAL_ASSETS = [
  // Left wall displays
  { id: 'l1', templateId: 'shelf-long', x: 2, y: 0, rotation: 180 },
  { id: 'l2', templateId: 'shelf-long', x: 10, y: 0, rotation: 180 },
  { id: 'l3', templateId: 'shelf-long', x: 18, y: 0, rotation: 180 },
  
  // Right wall displays
  { id: 'r1', templateId: 'shelf-long', x: 2, y: 15, rotation: 0 },
  { id: 'r2', templateId: 'shelf-long', x: 10, y: 15, rotation: 0 },
  { id: 'r3', templateId: 'shelf-long', x: 18, y: 15, rotation: 0 },
  
  // Back Wall (Main Branding)
  { id: 'b1', templateId: 'screen-horizontal', x: 12, y: 0, rotation: 180 },
  { id: 'b2', templateId: 'screen-horizontal', x: 12, y: 15, rotation: 0 },
  
  // Center Feature - "The Hero Zone"
  { id: 'a1', templateId: 'arcade-alien', x: 14, y: 7, rotation: 0 },
  { id: 'a2', templateId: 'arcade-starwars', x: 16, y: 7, rotation: 0 },
  
  // Floating Podiums
  { id: 'i1', templateId: 'pedestal', x: 6, y: 4, rotation: 0 },
  { id: 'i2', templateId: 'pedestal', x: 6, y: 11, rotation: 0 },
  { id: 'i3', templateId: 'pedestal', x: 22, y: 5, rotation: 0 },
  { id: 'i4', templateId: 'pedestal', x: 22, y: 10, rotation: 0 },
  
  // Entrance
  { id: 'ent', templateId: 'entrance-door', x: 0, y: 7, rotation: -90 },
];
