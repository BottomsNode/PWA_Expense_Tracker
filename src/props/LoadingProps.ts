export type LoadingSize = "sm" | "md" | "lg";

export interface LoadingProps {
  /**
   * Optional helper text to show under the loader.
   */
  message?: string;
  /**
   * Adjusts the spinner size to better fit different contexts.
   */
  size?: LoadingSize;
  /**
   * Sets the loader to cover the full viewport with a glass overlay.
   */
  fullscreen?: boolean;
  /**
   * Additional classes for the outer wrapper.
   */
  className?: string;
  /**
   * Accessible label for screen readers.
   */
  label?: string;
}
