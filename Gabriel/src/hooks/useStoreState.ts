/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { INITIAL_ASSETS } from '../constants';
import { PlacedAsset } from '../types';

export function useStoreState() {
  const [assets, setAssets] = useState<PlacedAsset[]>(INITIAL_ASSETS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const moveAsset = (id: string, deltaX: number, deltaY: number) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id !== id) return asset;
      return {
        ...asset,
        x: Math.max(0, asset.x + deltaX),
        y: Math.max(0, asset.y + deltaY)
      };
    }));
  };

  const updateAssetPosition = (id: string, x: number, y: number) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id !== id) return asset;
      return { ...asset, x, y };
    }));
  };

  const rotateAsset = (id: string) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id !== id) return asset;
      return {
        ...asset,
        rotation: (asset.rotation + 90) % 360
      };
    }));
  };

  const addAsset = (templateId: string) => {
    const newAsset: PlacedAsset = {
      id: Math.random().toString(36).substr(2, 9),
      templateId,
      x: 5,
      y: 2,
      rotation: 0
    };
    setAssets(prev => [...prev, newAsset]);
    setSelectedId(newAsset.id);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    setSelectedId(null);
  };

  const selectedAsset = assets.find(a => a.id === selectedId) || null;

  return {
    assets,
    selectedId,
    setSelectedId,
    selectedAsset,
    moveAsset,
    updateAssetPosition,
    rotateAsset,
    addAsset,
    deleteAsset
  };
}
