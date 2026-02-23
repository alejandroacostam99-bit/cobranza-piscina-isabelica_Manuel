import os

# Nombre del archivo que vamos a crear
output_file = 'proyecto_completo.txt'

# Carpetas que NO queremos leer (Basura o muy pesadas)
ignore_dirs = {'.git', 'node_modules', 'dist', 'build', '.vscode', '__pycache__'}

# Archivos que NO queremos leer (El propio script, candados, imágenes)
ignore_files = {'package-lock.json', 'yarn.lock', 'unificar.py', output_file, '.DS_Store'}

# Extensiones permitidas (Solo queremos código, no imágenes ni ejecutables)
allowed_extensions = {'.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.py', '.md'}

def is_text_file(filename):
    return any(filename.endswith(ext) for ext in allowed_extensions)

# Abrimos el archivo final para empezar a escribir
with open(output_file, 'w', encoding='utf-8') as outfile:
    # 'os.walk' recorre todas las carpetas y subcarpetas
    for root, dirs, files in os.walk('.'):
        # Filtramos para que no entre en carpetas ignoradas
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            # Si el archivo está en la lista negra o no es código, lo saltamos
            if file in ignore_files or not is_text_file(file):
                continue
                
            # Creamos la ruta completa del archivo
            path = os.path.join(root, file)
            
            # Escribimos un separador visual para que la IA sepa dónde empieza el archivo
            outfile.write(f"\n{'='*50}\n")
            outfile.write(f"ARCHIVO: {path}\n")
            outfile.write(f"{'='*50}\n\n")
            
            # Leemos el contenido del archivo original y lo copiamos
            try:
                with open(path, 'r', encoding='utf-8') as infile:
                    outfile.write(infile.read())
            except Exception as e:
                outfile.write(f"[Error leyendo archivo: {e}]")
            
            outfile.write("\n")

print(f"✅ ¡LISTO! Se ha creado el archivo '{output_file}'.")
print("👉 Ahora arrastra ese archivo al chat de la IA.")