"""
Image Service - Medical image analysis and processing
"""

import logging
import base64
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import io

# Image processing
from PIL import Image
import cv2
import numpy as np
import pydicom

logger = logging.getLogger(__name__)

class ImageService:
    """Service for medical image analysis and processing"""
    
    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.dcm', '.dicom', '.tiff', '.tif']
        self.max_image_size = (2048, 2048)
    
    async def analyze_medical_image(
        self, 
        image_data: bytes, 
        image_format: str = "jpg",
        analysis_type: str = "general"
    ) -> Dict[str, Any]:
        """Analyze medical image"""
        try:
            # Load image
            image = self._load_image(image_data, image_format)
            
            # Basic image analysis
            analysis = {
                "dimensions": image.size,
                "format": image_format,
                "mode": image.mode,
                "file_size": len(image_data),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Perform analysis based on type
            if analysis_type == "xray":
                analysis.update(await self._analyze_xray(image))
            elif analysis_type == "ct":
                analysis.update(await self._analyze_ct(image))
            elif analysis_type == "mri":
                analysis.update(await self._analyze_mri(image))
            elif analysis_type == "ultrasound":
                analysis.update(await self._analyze_ultrasound(image))
            else:
                analysis.update(await self._analyze_general(image))
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing medical image: {e}")
            return {
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _load_image(self, image_data: bytes, image_format: str) -> Image.Image:
        """Load image from bytes"""
        try:
            if image_format.lower() in ['dcm', 'dicom']:
                # Handle DICOM files
                dicom_data = pydicom.dcmread(io.BytesIO(image_data))
                pixel_array = dicom_data.pixel_array
                
                # Convert to PIL Image
                if len(pixel_array.shape) == 3:
                    # Color image
                    image = Image.fromarray(pixel_array)
                else:
                    # Grayscale image
                    image = Image.fromarray(pixel_array, mode='L')
                
                return image
            else:
                # Handle regular image formats
                return Image.open(io.BytesIO(image_data))
                
        except Exception as e:
            logger.error(f"Error loading image: {e}")
            raise
    
    async def _analyze_xray(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze X-ray image"""
        try:
            # Convert to grayscale if needed
            if image.mode != 'L':
                image = image.convert('L')
            
            # Convert to numpy array
            img_array = np.array(image)
            
            # Basic analysis
            analysis = {
                "analysis_type": "xray",
                "brightness": float(np.mean(img_array)),
                "contrast": float(np.std(img_array)),
                "histogram": self._calculate_histogram(img_array),
                "regions_of_interest": await self._detect_roi_xray(img_array),
                "anomalies_detected": await self._detect_xray_anomalies(img_array)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing X-ray: {e}")
            return {"error": str(e)}
    
    async def _analyze_ct(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze CT scan image"""
        try:
            # Convert to grayscale if needed
            if image.mode != 'L':
                image = image.convert('L')
            
            img_array = np.array(image)
            
            analysis = {
                "analysis_type": "ct",
                "hounsfield_units": self._calculate_hu_values(img_array),
                "tissue_density": await self._analyze_tissue_density(img_array),
                "organs_detected": await self._detect_organs_ct(img_array),
                "anomalies_detected": await self._detect_ct_anomalies(img_array)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing CT: {e}")
            return {"error": str(e)}
    
    async def _analyze_mri(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze MRI image"""
        try:
            # Convert to grayscale if needed
            if image.mode != 'L':
                image = image.convert('L')
            
            img_array = np.array(image)
            
            analysis = {
                "analysis_type": "mri",
                "signal_intensity": float(np.mean(img_array)),
                "tissue_contrast": await self._analyze_tissue_contrast(img_array),
                "brain_regions": await self._detect_brain_regions(img_array),
                "anomalies_detected": await self._detect_mri_anomalies(img_array)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing MRI: {e}")
            return {"error": str(e)}
    
    async def _analyze_ultrasound(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze ultrasound image"""
        try:
            # Convert to grayscale if needed
            if image.mode != 'L':
                image = image.convert('L')
            
            img_array = np.array(image)
            
            analysis = {
                "analysis_type": "ultrasound",
                "echo_patterns": await self._analyze_echo_patterns(img_array),
                "doppler_signals": await self._detect_doppler_signals(img_array),
                "anatomical_structures": await self._detect_ultrasound_structures(img_array),
                "anomalies_detected": await self._detect_ultrasound_anomalies(img_array)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing ultrasound: {e}")
            return {"error": str(e)}
    
    async def _analyze_general(self, image: Image.Image) -> Dict[str, Any]:
        """General image analysis"""
        try:
            # Convert to grayscale if needed
            if image.mode != 'L':
                image = image.convert('L')
            
            img_array = np.array(image)
            
            analysis = {
                "analysis_type": "general",
                "brightness": float(np.mean(img_array)),
                "contrast": float(np.std(img_array)),
                "edges_detected": await self._detect_edges(img_array),
                "texture_analysis": await self._analyze_texture(img_array),
                "color_analysis": await self._analyze_colors(image)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in general analysis: {e}")
            return {"error": str(e)}
    
    def _calculate_histogram(self, img_array: np.ndarray) -> List[int]:
        """Calculate image histogram"""
        try:
            hist, _ = np.histogram(img_array, bins=256, range=(0, 256))
            return hist.tolist()
        except Exception as e:
            logger.error(f"Error calculating histogram: {e}")
            return []
    
    def _calculate_hu_values(self, img_array: np.ndarray) -> Dict[str, float]:
        """Calculate Hounsfield units for CT scan"""
        try:
            # This is a simplified calculation
            # In real implementation, you'd need proper calibration
            mean_hu = float(np.mean(img_array))
            std_hu = float(np.std(img_array))
            
            return {
                "mean_hu": mean_hu,
                "std_hu": std_hu,
                "min_hu": float(np.min(img_array)),
                "max_hu": float(np.max(img_array))
            }
        except Exception as e:
            logger.error(f"Error calculating HU values: {e}")
            return {}
    
    async def _detect_roi_xray(self, img_array: np.ndarray) -> List[Dict[str, Any]]:
        """Detect regions of interest in X-ray"""
        try:
            # Simple edge detection for ROI
            edges = cv2.Canny(img_array, 50, 150)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            rois = []
            for i, contour in enumerate(contours):
                if cv2.contourArea(contour) > 100:  # Filter small contours
                    x, y, w, h = cv2.boundingRect(contour)
                    rois.append({
                        "id": i,
                        "bbox": [int(x), int(y), int(w), int(h)],
                        "area": float(cv2.contourArea(contour)),
                        "type": "potential_abnormality"
                    })
            
            return rois
            
        except Exception as e:
            logger.error(f"Error detecting X-ray ROI: {e}")
            return []
    
    async def _detect_xray_anomalies(self, img_array: np.ndarray) -> List[Dict[str, Any]]:
        """Detect anomalies in X-ray image"""
        try:
            # This is a simplified anomaly detection
            # In real implementation, you'd use trained models
            
            anomalies = []
            
            # Check for unusual brightness patterns
            mean_brightness = np.mean(img_array)
            std_brightness = np.std(img_array)
            
            if std_brightness > mean_brightness * 0.5:
                anomalies.append({
                    "type": "high_contrast",
                    "severity": "medium",
                    "description": "High contrast detected, possible abnormality",
                    "confidence": 0.6
                })
            
            # Check for dark spots (potential lesions)
            dark_threshold = mean_brightness * 0.3
            dark_pixels = np.sum(img_array < dark_threshold)
            total_pixels = img_array.size
            
            if dark_pixels / total_pixels > 0.1:
                anomalies.append({
                    "type": "dark_lesions",
                    "severity": "high",
                    "description": "Dark areas detected, possible lesions",
                    "confidence": 0.7
                })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting X-ray anomalies: {e}")
            return []
    
    async def _analyze_tissue_density(self, img_array: np.ndarray) -> Dict[str, Any]:
        """Analyze tissue density in CT scan"""
        try:
            # Simplified tissue density analysis
            mean_density = float(np.mean(img_array))
            
            # Classify tissue types based on density ranges
            tissue_types = {
                "air": np.sum((img_array < 50)),
                "lung": np.sum((img_array >= 50) & (img_array < 200)),
                "soft_tissue": np.sum((img_array >= 200) & (img_array < 400)),
                "bone": np.sum(img_array >= 400)
            }
            
            total_pixels = img_array.size
            tissue_percentages = {
                tissue: (count / total_pixels) * 100 
                for tissue, count in tissue_types.items()
            }
            
            return {
                "mean_density": mean_density,
                "tissue_distribution": tissue_percentages,
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing tissue density: {e}")
            return {}
    
    async def _detect_organs_ct(self, img_array: np.ndarray) -> List[Dict[str, Any]]:
        """Detect organs in CT scan"""
        try:
            # Simplified organ detection
            # In real implementation, you'd use trained segmentation models
            
            organs = []
            
            # Simple region-based detection
            height, width = img_array.shape
            center_x, center_y = width // 2, height // 2
            
            # Assume organs are in the center region
            center_region = img_array[
                center_y - height//4:center_y + height//4,
                center_x - width//4:center_x + width//4
            ]
            
            if np.mean(center_region) > 200:
                organs.append({
                    "name": "heart",
                    "bbox": [center_x - width//4, center_y - height//4, width//2, height//2],
                    "confidence": 0.6,
                    "density": float(np.mean(center_region))
                })
            
            return organs
            
        except Exception as e:
            logger.error(f"Error detecting organs in CT: {e}")
            return []
    
    async def _detect_ct_anomalies(self, img_array: np.ndarray) -> List[Dict[str, Any]]:
        """Detect anomalies in CT scan"""
        try:
            anomalies = []
            
            # Check for unusual density patterns
            mean_density = np.mean(img_array)
            std_density = np.std(img_array)
            
            if std_density > mean_density * 0.4:
                anomalies.append({
                    "type": "density_irregularity",
                    "severity": "medium",
                    "description": "Irregular density patterns detected",
                    "confidence": 0.5
                })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting CT anomalies: {e}")
            return []
    
    async def _analyze_tissue_contrast(self, img_array: np.ndarray) -> Dict[str, Any]:
        """Analyze tissue contrast in MRI"""
        try:
            # Calculate contrast between different regions
            height, width = img_array.shape
            
            # Divide image into regions
            top_half = img_array[:height//2, :]
            bottom_half = img_array[height//2:, :]
            
            top_mean = np.mean(top_half)
            bottom_mean = np.mean(bottom_half)
            
            contrast_ratio = abs(top_mean - bottom_mean) / max(top_mean, bottom_mean)
            
            return {
                "contrast_ratio": float(contrast_ratio),
                "top_region_mean": float(top_mean),
                "bottom_region_mean": float(bottom_mean),
                "contrast_quality": "good" if contrast_ratio > 0.2 else "poor"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing tissue contrast: {e}")
            return {}
    
    async def _detect_brain_regions(self, img_array: np.ndarray) -> List[Dict[str, Any]]:
        """Detect brain regions in MRI"""
        try:
            # Simplified brain region detection
            regions = []
            
            height, width = img_array.shape
            center_x, center_y = width // 2, height // 2
            
            # Assume brain is in the center
            brain_region = img_array[
                center_y - height//3:center_y + height//3,
                center_x - width//3:center_x + width//3
            ]
            
            if np.mean(brain_region) > 100:
                regions.append({
                    "name": "brain_tissue",
                    "bbox": [center_x - width//3, center_y - height//3, 2*width//3, 2*height//3],
                    "confidence": 0.7,
                    "signal_intensity": float(np.mean(brain_region))
                })
            
            return regions
            
        except Exception as e:
            logger.error(f"Error detecting brain regions: {e}")
            return []
    
    async def _detect_mri_anomalies(self, img_array: np.ndarray) -> List[Dict[str, Any]]:
        """Detect anomalies in MRI"""
        try:
            anomalies = []
            
            # Check for signal intensity variations
            mean_intensity = np.mean(img_array)
            std_intensity = np.std(img_array)
            
            if std_intensity > mean_intensity * 0.5:
                anomalies.append({
                    "type": "signal_irregularity",
                    "severity": "medium",
                    "description": "Irregular signal intensity detected",
                    "confidence": 0.6
                })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting MRI anomalies: {e}")
            return []
    
    async def _analyze_echo_patterns(self, img_array: np.ndarray) -> Dict[str, Any]:
        """Analyze echo patterns in ultrasound"""
        try:
            # Analyze echo patterns
            mean_echo = np.mean(img_array)
            echo_variance = np.var(img_array)
            
            return {
                "mean_echo_intensity": float(mean_echo),
                "echo_variance": float(echo_variance),
                "echo_quality": "good" if echo_variance > 1000 else "poor"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing echo patterns: {e}")
            return {}
    
    async def _detect_doppler_signals(self, img_array: np.ndarray) -> List[Dict[str, Any]]:
        """Detect Doppler signals in ultrasound"""
        try:
            # Simplified Doppler detection
            signals = []
            
            # Look for high-intensity regions (potential blood flow)
            high_intensity_threshold = np.mean(img_array) + 2 * np.std(img_array)
            high_intensity_regions = img_array > high_intensity_threshold
            
            if np.any(high_intensity_regions):
                signals.append({
                    "type": "blood_flow",
                    "intensity": float(np.mean(img_array[high_intensity_regions])),
                    "confidence": 0.5
                })
            
            return signals
            
        except Exception as e:
            logger.error(f"Error detecting Doppler signals: {e}")
            return []
    
    async def _detect_ultrasound_structures(self, img_array: np.ndarray) -> List[Dict[str, Any]]:
        """Detect anatomical structures in ultrasound"""
        try:
            structures = []
            
            # Simple structure detection based on intensity patterns
            mean_intensity = np.mean(img_array)
            
            # Look for different intensity regions
            high_intensity = img_array > mean_intensity * 1.2
            low_intensity = img_array < mean_intensity * 0.8
            
            if np.any(high_intensity):
                structures.append({
                    "name": "high_echo_structure",
                    "type": "possible_bone_or_calcification",
                    "confidence": 0.6
                })
            
            if np.any(low_intensity):
                structures.append({
                    "name": "low_echo_structure",
                    "type": "possible_fluid_or_cyst",
                    "confidence": 0.5
                })
            
            return structures
            
        except Exception as e:
            logger.error(f"Error detecting ultrasound structures: {e}")
            return []
    
    async def _detect_ultrasound_anomalies(self, img_array: np.ndarray) -> List[Dict[str, Any]]:
        """Detect anomalies in ultrasound"""
        try:
            anomalies = []
            
            # Check for unusual echo patterns
            mean_intensity = np.mean(img_array)
            std_intensity = np.std(img_array)
            
            if std_intensity > mean_intensity * 0.6:
                anomalies.append({
                    "type": "echo_irregularity",
                    "severity": "medium",
                    "description": "Irregular echo patterns detected",
                    "confidence": 0.5
                })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting ultrasound anomalies: {e}")
            return []
    
    async def _detect_edges(self, img_array: np.ndarray) -> Dict[str, Any]:
        """Detect edges in image"""
        try:
            edges = cv2.Canny(img_array, 50, 150)
            edge_pixels = np.sum(edges > 0)
            total_pixels = edges.size
            
            return {
                "edge_density": float(edge_pixels / total_pixels),
                "edge_count": int(edge_pixels),
                "edge_quality": "good" if edge_pixels > total_pixels * 0.1 else "poor"
            }
            
        except Exception as e:
            logger.error(f"Error detecting edges: {e}")
            return {}
    
    async def _analyze_texture(self, img_array: np.ndarray) -> Dict[str, Any]:
        """Analyze image texture"""
        try:
            # Calculate texture features
            mean_intensity = np.mean(img_array)
            std_intensity = np.std(img_array)
            
            # Calculate local binary pattern (simplified)
            texture_variance = np.var(img_array)
            
            return {
                "mean_intensity": float(mean_intensity),
                "intensity_std": float(std_intensity),
                "texture_variance": float(texture_variance),
                "texture_complexity": "high" if texture_variance > 1000 else "low"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing texture: {e}")
            return {}
    
    async def _analyze_colors(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze colors in image"""
        try:
            if image.mode == 'L':
                return {"mode": "grayscale", "color_count": 1}
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Get color palette
            colors = image.getcolors(maxcolors=256*256*256)
            
            if colors:
                dominant_color = max(colors, key=lambda x: x[0])
                return {
                    "mode": "color",
                    "color_count": len(colors),
                    "dominant_color": dominant_color[1],
                    "dominant_frequency": dominant_color[0]
                }
            else:
                return {"mode": "color", "color_count": 0}
                
        except Exception as e:
            logger.error(f"Error analyzing colors: {e}")
            return {}
    
    async def preprocess_image(
        self, 
        image_data: bytes, 
        image_format: str,
        target_size: Optional[Tuple[int, int]] = None
    ) -> bytes:
        """Preprocess image for analysis"""
        try:
            image = self._load_image(image_data, image_format)
            
            # Resize if needed
            if target_size:
                image = image.resize(target_size, Image.Resampling.LANCZOS)
            elif image.size > self.max_image_size:
                image.thumbnail(self.max_image_size, Image.Resampling.LANCZOS)
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Save to bytes
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=85)
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise
    
    async def generate_thumbnail(
        self, 
        image_data: bytes, 
        image_format: str,
        size: Tuple[int, int] = (200, 200)
    ) -> bytes:
        """Generate thumbnail of image"""
        try:
            image = self._load_image(image_data, image_format)
            image.thumbnail(size, Image.Resampling.LANCZOS)
            
            output = io.BytesIO()
            image.save(output, format='JPEG', quality=80)
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Error generating thumbnail: {e}")
            raise