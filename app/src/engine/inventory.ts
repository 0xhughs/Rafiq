import type { ItemId } from './types';

export function grantItem(inventory: readonly ItemId[], id: ItemId): ItemId[] {
  if (inventory.includes(id)) return [...inventory];
  return [...inventory, id];
}

export function removeItem(inventory: readonly ItemId[], id: ItemId): ItemId[] {
  return inventory.filter((item) => item !== id);
}

export function hasItem(inventory: readonly ItemId[], id: ItemId): boolean {
  return inventory.includes(id);
}

export function syncInventory(inventory: readonly ItemId[], trash: 'home' | 'carried' | 'disposed'): ItemId[] {
  if (trash === 'carried') return grantItem(inventory, 'trash_bag');
  return removeItem(inventory, 'trash_bag');
}
