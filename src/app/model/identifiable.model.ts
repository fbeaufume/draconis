/**
 * Base class that provides automatic ID assignment.
 * Each instance gets a unique incrementing ID starting from 1.
 * This is used for the track part of Angular @for.
 */
export abstract class Identifiable {

  /**
   * Unique identifier for this instance.
   */
  id: number;

  /**
   * Static counter to track the next ID to assign.
   */
  private static nextId: number = 1;

  protected constructor() {
    this.id = Identifiable.nextId++;
  }
}

