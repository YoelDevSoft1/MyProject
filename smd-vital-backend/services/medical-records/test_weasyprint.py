#!/usr/bin/env python3
"""
Script de prueba para verificar que WeasyPrint funciona correctamente
"""

import sys
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_weasyprint_import():
    """Probar la importación de WeasyPrint"""
    try:
        from weasyprint import HTML, CSS
        from weasyprint.text.fonts import FontConfiguration
        logger.info("✅ WeasyPrint importado correctamente")
        return True
    except ImportError as e:
        logger.error(f"❌ Error importando WeasyPrint: {e}")
        return False

def test_weasyprint_basic_functionality():
    """Probar funcionalidad básica de WeasyPrint"""
    try:
        from weasyprint import HTML, CSS
        from weasyprint.text.fonts import FontConfiguration
        
        # HTML simple de prueba
        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Prueba WeasyPrint</title>
        </head>
        <body>
            <h1>Prueba de WeasyPrint</h1>
            <p>Este es un documento de prueba generado con WeasyPrint.</p>
        </body>
        </html>
        """
        
        # CSS simple
        css_content = """
        body { font-family: Arial, sans-serif; }
        h1 { color: #2c5aa0; }
        """
        
        # Configurar fuentes
        font_config = FontConfiguration()
        
        # Generar PDF
        html_doc = HTML(string=html_content)
        css_doc = CSS(string=css_content, font_config=font_config)
        
        pdf_bytes = html_doc.write_pdf(stylesheets=[css_doc])
        
        if len(pdf_bytes) > 0:
            logger.info(f"✅ PDF generado correctamente ({len(pdf_bytes)} bytes)")
            return True
        else:
            logger.error("❌ PDF generado está vacío")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error en funcionalidad básica de WeasyPrint: {e}")
        return False

def test_system_libraries():
    """Probar que las librerías del sistema están disponibles"""
    import ctypes
    import ctypes.util
    
    libraries_to_test = [
        'pango-1.0-0',
        'cairo',
        'gobject-2.0',
        'glib-2.0'
    ]
    
    all_found = True
    for lib in libraries_to_test:
        try:
            lib_path = ctypes.util.find_library(lib)
            if lib_path:
                logger.info(f"✅ Librería {lib} encontrada: {lib_path}")
            else:
                logger.warning(f"⚠️  Librería {lib} no encontrada")
                all_found = False
        except Exception as e:
            logger.error(f"❌ Error buscando librería {lib}: {e}")
            all_found = False
    
    return all_found

def main():
    """Función principal de prueba"""
    logger.info("🧪 Iniciando pruebas de WeasyPrint...")
    
    tests = [
        ("Importación de WeasyPrint", test_weasyprint_import),
        ("Librerías del sistema", test_system_libraries),
        ("Funcionalidad básica", test_weasyprint_basic_functionality)
    ]
    
    results = []
    for test_name, test_func in tests:
        logger.info(f"\n🔍 Ejecutando: {test_name}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"❌ Error inesperado en {test_name}: {e}")
            results.append((test_name, False))
    
    # Resumen
    logger.info("\n📊 RESUMEN DE PRUEBAS:")
    logger.info("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        logger.info(f"{test_name}: {status}")
        if result:
            passed += 1
    
    logger.info(f"\n🎯 Resultado: {passed}/{len(results)} pruebas pasaron")
    
    if passed == len(results):
        logger.info("🎉 ¡Todas las pruebas pasaron! WeasyPrint está funcionando correctamente.")
        sys.exit(0)
    else:
        logger.error("💥 Algunas pruebas fallaron. Revisar la configuración de WeasyPrint.")
        sys.exit(1)

if __name__ == "__main__":
    main()
