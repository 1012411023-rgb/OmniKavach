import numpy as np
import statistics
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


def detect_lab_outlier(current_value: float, historical_values: List[float]) -> Dict[str, Any]:
    """
    Detect if a current lab value is a statistical outlier using Z-score analysis.
    
    This function implements deterministic statistical logic to identify values that are
    more than 2.5 standard deviations away from the historical mean, which could
    indicate measurement errors, sample contamination, or acute clinical changes.
    
    Args:
        current_value: The most recent lab value to evaluate
        historical_values: List of previous lab values for the same patient
        
    Returns:
        Dictionary containing outlier status and optional reason:
        - {"is_outlier": True, "reason": "Statistical anomaly detected (>2.5 SD). Probable lab error."}
        - {"is_outlier": False}
        
    Raises:
        ValueError: If historical_values is empty or contains invalid data
    """
    if not historical_values:
        raise ValueError("Historical values list cannot be empty for outlier detection")
    
    if len(historical_values) < 2:
        logger.warning("Insufficient historical data for reliable outlier detection (need at least 2 values)")
        return {"is_outlier": False}
    
    # Clean and validate historical data
    clean_historical = []
    for val in historical_values:
        try:
            if val is not None and not np.isnan(val) and np.isfinite(val):
                clean_historical.append(float(val))
        except (ValueError, TypeError):
            logger.warning(f"Skipping invalid historical value: {val}")
            continue
    
    if len(clean_historical) < 2:
        return {"is_outlier": False}
    
    # Calculate statistical parameters
    historical_mean = np.mean(clean_historical)
    historical_std = np.std(clean_historical)
    
    # Handle edge case where all historical values are identical
    if historical_std == 0:
        # If all values are the same, any deviation is significant
        if abs(current_value - historical_mean) > 0.1:
            return {
                "is_outlier": True,
                "reason": "Statistical anomaly detected (>2.5 SD). Probable lab error."
            }
        return {"is_outlier": False}
    
    # Calculate Z-score (number of standard deviations from mean)
    z_score = abs(current_value - historical_mean) / historical_std
    
    logger.debug(f"Lab value analysis: current={current_value}, mean={historical_mean:.2f}, "
                f"std={historical_std:.2f}, z_score={z_score:.2f}")
    
    # Outlier threshold: 2.5 standard deviations
    outlier_threshold = 2.5
    
    if z_score > outlier_threshold:
        return {
            "is_outlier": True,
            "reason": "Statistical anomaly detected (>2.5 SD). Probable lab error."
        }
    
    return {"is_outlier": False}


def detect_baseline_contradiction(
    current_value: float,
    historical_values: List[float],
    timestamps: List[str] = None,
    lab_name: str = "Lab Value",
    unit: str = "",
) -> Dict[str, Any]:
    """
    Advanced outlier detection that returns full baseline contradiction data
    for the Chief Synthesis Agent to evaluate.
    
    If the new value exceeds 2.5 SD from the historical mean, the function
    returns a structured report that instructs the Chief Agent to:
      1. REFUSE to incorporate the value into any risk assessment.
      2. FLAG the value as a probable mislabeled result or sensor error.
      3. BLOCK diagnosis revision until a confirmed redraw is received.
    
    Args:
        current_value: The newly arrived lab value
        historical_values: List of prior values (minimum 3 days of data recommended)
        timestamps: Optional parallel list of ISO timestamp strings
        lab_name: Human-readable lab test name (e.g. "Lactate")
        unit: Measurement unit (e.g. "mmol/L")
    
    Returns:
        Dict with is_outlier, severity, baseline statistics, z_score,
        verdict, and chief_agent_directive.
    """
    if not historical_values or len(historical_values) < 2:
        return {"is_outlier": False, "reason": "Insufficient historical data"}

    clean = [float(v) for v in historical_values
             if v is not None and np.isfinite(v)]
    if len(clean) < 2:
        return {"is_outlier": False, "reason": "Insufficient clean historical data"}

    hist_mean = float(np.mean(clean))
    hist_std = float(np.std(clean))

    # Guard: identical historical values
    if hist_std == 0:
        hist_std = 0.01  # avoid division by zero; any deviation is huge

    z_score = abs(current_value - hist_mean) / hist_std
    threshold = 2.5

    baseline_summary = {
        "label": f"{lab_name} (72h Baseline)",
        "mean": round(hist_mean, 2),
        "stdDev": round(hist_std, 2),
        "values": [
            {
                "time": timestamps[i] if timestamps and i < len(timestamps) else f"T+{i}",
                "value": round(v, 2),
                "unit": unit,
            }
            for i, v in enumerate(clean)
        ],
    }

    if z_score <= threshold:
        return {
            "is_outlier": False,
            "z_score": round(z_score, 2),
            "baseline": baseline_summary,
        }

    # ── OUTLIER CONFIRMED ──
    severity = "critical" if z_score > 5.0 else "warning"
    verdict = (
        f"REJECTED — exceeds 2.5 SD threshold by "
        f"{round(z_score - threshold, 1)}σ"
    )

    return {
        "is_outlier": True,
        "severity": severity,
        "z_score": round(z_score, 2),
        "baseline": baseline_summary,
        "problematic_value": {
            "value": current_value,
            "unit": unit,
            "z_score": round(z_score, 2),
            "verdict": verdict,
        },
        "reason": (
            f"PROBABLE MISLABELED RESULT: {lab_name} {current_value} {unit} "
            f"contradicts baseline (mean {hist_mean:.2f} ± {hist_std:.2f} {unit}) "
            f"by {z_score:.1f}σ."
        ),
        "chief_agent_directive": (
            "REFUSE to incorporate this value into the risk assessment. "
            "The current diagnosis must remain unchanged based on the last "
            "verified dataset. A confirmed lab redraw is REQUIRED before "
            "any diagnostic revision may proceed."
        ),
        "diagnosis_blocked": True,
    }


def calculate_trend(values: List[float]) -> str:
    """
    Calculate the simple trend of the last 5 lab values.
    
    This function analyzes the direction of lab values over time using
    linear regression on the most recent 5 values to determine trend.
    
    Args:
        values: List of lab values in chronological order (oldest to newest)
        
    Returns:
        String indicating trend: "Increasing", "Decreasing", or "Stable"
    """
    if len(values) < 2:
        return "Stable"  # Insufficient data for trend analysis
    
    # Take the last 5 values (or fewer if not available)
    recent_values = values[-5:] if len(values) >= 5 else values
    
    # Clean data
    clean_values = []
    for val in recent_values:
        try:
            if val is not None and not np.isnan(val) and np.isfinite(val):
                clean_values.append(float(val))
        except (ValueError, TypeError):
            continue
    
    if len(clean_values) < 2:
        return "Stable"
    
    # Simple trend analysis using linear regression
    x = list(range(len(clean_values)))
    y = clean_values
    
    # Calculate slope using numpy
    if len(clean_values) >= 2:
        slope = np.polyfit(x, y, 1)[0]
        
        # Determine trend based on slope magnitude
        # Use relative threshold based on value range
        value_range = max(clean_values) - min(clean_values)
        threshold = value_range * 0.1  # 10% of range as threshold
        
        if abs(slope) < 0.01 or value_range < 0.1:  # Very small slope or very small range
            return "Stable"
        elif slope > threshold:
            return "Increasing"
        elif slope < -threshold:
            return "Decreasing"
        else:
            return "Stable"
    
    return "Stable"


def validate_vital_sign_ranges(vital_type: str, value: float) -> Dict[str, Any]:
    """
    Validate if a vital sign value is within physiologically reasonable ranges.
    
    Args:
        vital_type: Type of vital sign (e.g., "Heart Rate", "MAP", "Temperature")
        value: The vital sign value to validate
        
    Returns:
        Dictionary with validation result and clinical context
    """
    
    # Define physiologically reasonable ranges for common vital signs
    vital_ranges = {
        "heart rate": {"min": 30, "max": 220, "unit": "bpm"},
        "map": {"min": 20, "max": 150, "unit": "mmHg"},
        "mean arterial pressure": {"min": 20, "max": 150, "unit": "mmHg"},
        "systolic": {"min": 40, "max": 250, "unit": "mmHg"},
        "diastolic": {"min": 20, "max": 150, "unit": "mmHg"},
        "temperature": {"min": 35.0, "max": 42.0, "unit": "°C"},
        "respiratory rate": {"min": 4, "max": 60, "unit": "breaths/min"},
        "oxygen saturation": {"min": 70, "max": 100, "unit": "%"},
    }
    
    vital_type_lower = vital_type.lower()
    
    # Find matching vital sign type
    range_info = None
    for key, info in vital_ranges.items():
        if key in vital_type_lower:
            range_info = info
            break
    
    if not range_info:
        # Unknown vital type - assume it's valid but log for review
        logger.warning(f"Unknown vital sign type: {vital_type}")
        return {"is_valid": True, "message": f"Unknown vital sign type: {vital_type}"}
    
    min_val, max_val = range_info["min"], range_info["max"]
    
    if value < min_val or value > max_val:
        return {
            "is_valid": False,
            "message": f"{vital_type} value {value} {range_info['unit']} is outside physiological range ({min_val}-{max_val} {range_info['unit']})"
        }
    
    return {"is_valid": True, "message": f"{vital_type} within normal range"}
