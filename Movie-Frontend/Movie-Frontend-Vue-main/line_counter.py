#!/usr/bin/env python3
"""
Code Line Counter

This program counts the lines of code in a project, excluding specified directories.
It can be configured via a config file to skip certain directories like node_modules,
.venv, __pycache__, etc.
"""

import os
import json
import argparse
from pathlib import Path


def count_lines_in_file(file_path):
    """Count lines in a single file, excluding empty lines and comments."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        
        # Count non-empty lines (excluding whitespace-only lines)
        code_lines = 0
        for line in lines:
            stripped = line.strip()
            # Skip empty lines and lines with only whitespace
            if stripped:
                code_lines += 1
        
        return code_lines
    except Exception:
        # If there's an error reading the file, return 0
        return 0


def should_exclude_path(path, exclude_patterns):
    """Check if a path should be excluded based on the exclude patterns."""
    path_str = str(path)
    
    for pattern in exclude_patterns:
        if pattern in path_str:
            return True
    
    return False


def get_supported_extensions():
    """Return a set of file extensions to include in the count."""
    return {
        '.py', '.js', '.ts', '.jsx', '.tsx',  # Web/Scripting
        '.java', '.cpp', '.c', '.h', '.hpp',  # C/C++/Java
        '.cs',  # C#
        '.go',  # Go
        '.rs',  # Rust
        '.swift',  # Swift
        '.kt', '.kts',  # Kotlin
        '.scala',  # Scala
        '.rb',  # Ruby
        '.php',  # PHP
        '.html', '.css',  # Web
        '.dart',  # Dart
        '.m', '.mm',  # Objective-C
        '.sql',  # SQL
        '.sh',  # Shell scripts
        '.yaml', '.yml',  # YAML
        '.json',  # JSON (though mostly data)
        '.md',  # Markdown (documentation)
        '.txt',  # Text files
        '.toml',  # TOML
        '.ini',  # INI files
        '.cfg',  # Configuration files
        '.xml',  # XML files
        '.vue',  # Vue.js
        '.svelte',  # Svelte
    }


def count_lines_in_project(root_dir, exclude_patterns, supported_extensions):
    """Count lines in all files in the project."""
    total_lines = 0
    file_count = 0
    results = {}
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Remove excluded directories from dirnames to avoid walking them
        dirnames[:] = [d for d in dirnames if not should_exclude_path(
            os.path.join(dirpath, d), exclude_patterns)]
        
        for filename in filenames:
            file_path = os.path.join(dirpath, filename)
            file_ext = Path(file_path).suffix.lower()
            
            if file_ext in supported_extensions and not should_exclude_path(file_path, exclude_patterns):
                lines = count_lines_in_file(file_path)
                total_lines += lines
                file_count += 1
                
                if lines > 0:
                    results[file_path] = lines
    
    return total_lines, file_count, results


def load_config(config_path):
    """Load configuration from a JSON file."""
    default_config = {
        "exclude_directories": [
            "node_modules",
            ".venv",
            "__pycache__",
            ".git",
            ".svn",
            ".hg",
            "dist",
            "build",
            "target",
            ".next",
            ".nuxt",
            "vendor",
            ".idea",
            ".vscode",
            ".pytest_cache",
            ".tox",
            "env",
            "venv",
            "ENV",
            ".bundle"
        ]
    }

    if os.path.exists(config_path):
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                # Merge with defaults to ensure all keys exist
                for key, value in default_config.items():
                    if key not in user_config:
                        user_config[key] = value
                    elif isinstance(value, list) and key in user_config:
                        # Add user-provided items to the default list (avoid duplicates)
                        for item in user_config[key]:
                            if item not in value:
                                value.append(item)
                        user_config[key] = value
            return user_config
        except json.JSONDecodeError:
            print(f"Warning: Could not parse config file {config_path}. Using defaults.")
            return default_config
    else:
        # Create default config file if it doesn't exist
        save_config(config_path, default_config)
        return default_config


def save_config(config_path, config_data):
    """Save configuration to a JSON file."""
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config_data, f, indent=2, ensure_ascii=False)
    print(f"Created default configuration file at {config_path}")


def main():
    parser = argparse.ArgumentParser(description="Count lines of code in a project")
    parser.add_argument("directory", nargs="?", default=".", 
                        help="Directory to analyze (default: current directory)")
    parser.add_argument("-c", "--config", default="line_counter_config.json",
                        help="Configuration file path (default: line_counter_config.json)")
    parser.add_argument("--show-files", action="store_true",
                        help="Show count for each individual file")
    parser.add_argument("--save-config", action="store_true",
                        help="Save default configuration file")
    
    args = parser.parse_args()
    
    # Load configuration
    config = load_config(args.config)
    
    if args.save_config:
        save_config(args.config, config)
        return
    
    # Get directory to analyze
    root_dir = os.path.abspath(args.directory)
    
    if not os.path.isdir(root_dir):
        print(f"Error: {root_dir} is not a directory")
        return
    
    # Get supported file extensions
    supported_extensions = get_supported_extensions()
    
    # Count lines
    print(f"Analyzing code in: {root_dir}")
    print("Excluded directories:", config["exclude_directories"])
    print("Supported file extensions:", sorted(supported_extensions))
    print("-" * 50)
    
    total_lines, file_count, results = count_lines_in_project(
        root_dir, config["exclude_directories"], supported_extensions
    )
    
    print(f"Total lines of code: {total_lines:,}")
    print(f"Total files counted: {file_count:,}")
    
    if args.show_files:
        print("\nFile-by-file breakdown:")
        print("-" * 50)
        # Sort by line count (descending) then by path
        sorted_results = sorted(results.items(), key=lambda x: (-x[1], x[0]))
        for file_path, lines in sorted_results:
            print(f"{lines:>8,} lines | {file_path}")


if __name__ == "__main__":
    main()