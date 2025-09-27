"""
Monitoring Service - Vital signs analysis and monitoring
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
import numpy as np

logger = logging.getLogger(__name__)

class MonitoringService:
    """Service for vital signs monitoring and analysis"""
    
    def __init__(self):
        self.normal_ranges = {
            "adult": {
                "blood_pressure": {"systolic": [90, 140], "diastolic": [60, 90]},
                "heart_rate": [60, 100],
                "respiratory_rate": [12, 20],
                "temperature": [36.1, 37.2],
                "oxygen_saturation": [95, 100]
            }
        }
    
    async def analyze_vital_signs(self, vital_signs: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze vital signs data"""
        try:
            analysis = {
                "timestamp": datetime.utcnow().isoformat(),
                "vital_signs": vital_signs,
                "analysis": {},
                "alerts": [],
                "overall_status": "normal"
            }
            
            # Analyze each vital sign
            for parameter, value in vital_signs.items():
                if parameter == "blood_pressure":
                    analysis["analysis"][parameter] = await self._analyze_blood_pressure(value)
                elif parameter == "heart_rate":
                    analysis["analysis"][parameter] = await self._analyze_heart_rate(value)
                elif parameter == "respiratory_rate":
                    analysis["analysis"][parameter] = await self._analyze_respiratory_rate(value)
                elif parameter == "temperature":
                    analysis["analysis"][parameter] = await self._analyze_temperature(value)
                elif parameter == "oxygen_saturation":
                    analysis["analysis"][parameter] = await self._analyze_oxygen_saturation(value)
            
            # Generate alerts
            analysis["alerts"] = await self._generate_alerts(analysis["analysis"])
            
            # Determine overall status
            if any(alert["severity"] == "critical" for alert in analysis["alerts"]):
                analysis["overall_status"] = "critical"
            elif any(alert["severity"] == "high" for alert in analysis["alerts"]):
                analysis["overall_status"] = "high"
            elif any(alert["severity"] == "medium" for alert in analysis["alerts"]):
                analysis["overall_status"] = "medium"
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing vital signs: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _analyze_blood_pressure(self, bp: Dict[str, float]) -> Dict[str, Any]:
        """Analyze blood pressure"""
        systolic = bp.get("systolic", 0)
        diastolic = bp.get("diastolic", 0)
        
        normal_sys = self.normal_ranges["adult"]["blood_pressure"]["systolic"]
        normal_dia = self.normal_ranges["adult"]["blood_pressure"]["diastolic"]
        
        status = "normal"
        if systolic < normal_sys[0] or diastolic < normal_dia[0]:
            status = "low"
        elif systolic > normal_sys[1] or diastolic > normal_dia[1]:
            status = "high"
        
        return {
            "systolic": systolic,
            "diastolic": diastolic,
            "status": status,
            "normal_range": f"{normal_sys[0]}-{normal_sys[1]}/{normal_dia[0]}-{normal_dia[1]}"
        }
    
    async def _analyze_heart_rate(self, hr: float) -> Dict[str, Any]:
        """Analyze heart rate"""
        normal_range = self.normal_ranges["adult"]["heart_rate"]
        
        status = "normal"
        if hr < normal_range[0]:
            status = "bradycardia"
        elif hr > normal_range[1]:
            status = "tachycardia"
        
        return {
            "value": hr,
            "status": status,
            "normal_range": f"{normal_range[0]}-{normal_range[1]}"
        }
    
    async def _analyze_respiratory_rate(self, rr: float) -> Dict[str, Any]:
        """Analyze respiratory rate"""
        normal_range = self.normal_ranges["adult"]["respiratory_rate"]
        
        status = "normal"
        if rr < normal_range[0]:
            status = "bradypnea"
        elif rr > normal_range[1]:
            status = "tachypnea"
        
        return {
            "value": rr,
            "status": status,
            "normal_range": f"{normal_range[0]}-{normal_range[1]}"
        }
    
    async def _analyze_temperature(self, temp: float) -> Dict[str, Any]:
        """Analyze temperature"""
        normal_range = self.normal_ranges["adult"]["temperature"]
        
        status = "normal"
        if temp < normal_range[0]:
            status = "hypothermia"
        elif temp > normal_range[1]:
            status = "hyperthermia"
        
        return {
            "value": temp,
            "status": status,
            "normal_range": f"{normal_range[0]}-{normal_range[1]}"
        }
    
    async def _analyze_oxygen_saturation(self, spo2: float) -> Dict[str, Any]:
        """Analyze oxygen saturation"""
        normal_range = self.normal_ranges["adult"]["oxygen_saturation"]
        
        status = "normal"
        if spo2 < normal_range[0]:
            status = "hypoxemia"
        
        return {
            "value": spo2,
            "status": status,
            "normal_range": f"{normal_range[0]}-{normal_range[1]}"
        }
    
    async def _generate_alerts(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate alerts based on analysis"""
        alerts = []
        
        for parameter, data in analysis.items():
            if data.get("status") == "high":
                alerts.append({
                    "parameter": parameter,
                    "severity": "high",
                    "message": f"{parameter} elevado: {data.get('value', 'N/A')}",
                    "recommendation": "Consultar médico"
                })
            elif data.get("status") == "low":
                alerts.append({
                    "parameter": parameter,
                    "severity": "medium",
                    "message": f"{parameter} bajo: {data.get('value', 'N/A')}",
                    "recommendation": "Monitorear de cerca"
                })
        
        return alerts