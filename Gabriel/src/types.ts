/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AssetType = 'screen' | 'arcade' | 'shelf' | 'stand' | 'decoration' | 'door';

export interface AssetTemplate {
  id: string;
  name: string;
  type: AssetType;
  width: number; // in grid units (0.5m each)
  height: number; // in grid units (0.5m each) - for depth on the floor
  depth: number; // in grid units (0.5m each) - vertical height
  color: string;
  icon: string;
}

export interface PlacedAsset {
  id: string;
  templateId: string;
  x: number; // grid pos
  y: number; // grid pos
  rotation: number; // 0, 90, 180, 270
  content?: string; // image/video URL for screens
}

export const GRID_SIZE = 0.5; // meters
export const STORE_WIDTH = 8.0; // meters (Widened for flagship store feel)
export const STORE_LENGTH = 16.0; // meters

export const GRID_UNITS_X = Math.ceil(STORE_LENGTH / GRID_SIZE); // 32
export const GRID_UNITS_Y = Math.ceil(STORE_WIDTH / GRID_SIZE); // 16
