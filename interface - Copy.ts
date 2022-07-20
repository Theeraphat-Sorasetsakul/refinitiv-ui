export interface CacheInterface {
  /**
   * Returns all value into a Map
   */
  restoreItems(store: string): Map<string, unknown>;
  /**
   * Set a value against a key to use until expired
   */
  set(store: string, key: string, value: unknown): void;
  /**
   * Returns the value in this storage that matched by the key.
   */
  get(store: string, key: string): unknown | null;

}