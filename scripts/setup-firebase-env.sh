#!/bin/bash

# Firebase Environment Setup Script
# This script helps users configure Firebase environment variables interactively

set -e

echo "🔥 Firebase Environment Setup Script"
echo "===================================="
echo "This script will help you configure your Firebase environment variables."
echo "Please have your Firebase project details ready."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
        *)
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Function to prompt for input with validation
prompt_for_value() {
    local var_name=$1
    local description=$2
    local validation_pattern=$3
    local example=$4
    local current_value=$5
    
    echo ""
    print_status "INFO" "Configuring: $var_name"
    echo "Description: $description"
    if [ -n "$example" ]; then
        echo "Example: $example"
    fi
    if [ -n "$current_value" ] && ! [[ "$current_value" == *"REPLACE_WITH"* ]]; then
        echo "Current value: $current_value"
        echo "Press Enter to keep current value or type a new one:"
    else
        echo "Please enter the value:"
    fi
    
    while true; do
        read -p "> " input_value
        
        # Use current value if user presses Enter and current value exists
        if [ -z "$input_value" ] && [ -n "$current_value" ] && ! [[ "$current_value" == *"REPLACE_WITH"* ]]; then
            echo "$current_value"
            return 0
        fi
        
        # Validate input if pattern provided
        if [ -n "$validation_pattern" ]; then
            if echo "$input_value" | grep -qE "$validation_pattern"; then
                echo "$input_value"
                return 0
            else
                print_status "ERROR" "Invalid format. Please match pattern: $validation_pattern"
            fi
        else
            if [ -n "$input_value" ]; then
                echo "$input_value"
                return 0
            else
                print_status "ERROR" "Value cannot be empty. Please enter a valid value."
            fi
        fi
    done
}

# Function to extract value from JSON file
extract_from_json() {
    local json_file=$1
    local key_path=$2
    
    if [ ! -f "$json_file" ]; then
        print_status "ERROR" "JSON file not found: $json_file"
        return 1
    fi
    
    # Try to extract using Python first (more reliable)
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "
import json, sys
try:
    with open('$json_file', 'r') as f:
        data = json.load(f)
    keys = '$key_path'.split('.')
    value = data
    for key in keys:
        value = value[key]
    print(value)
except Exception as e:
    sys.exit(1)
" 2>/dev/null && return 0
    fi
    
    # Fallback to jq if available
    if command -v jq >/dev/null 2>&1; then
        jq -r ".$key_path" "$json_file" 2>/dev/null && return 0
    fi
    
    print_status "ERROR" "Cannot extract value from JSON. Please install python3 or jq."
    return 1
}

# Function to format private key
format_private_key() {
    local key=$1
    # Ensure the key is properly wrapped in quotes and has \n characters
    if [[ "$key" == *"-----BEGIN PRIVATE KEY-----"* ]] && [[ "$key" == *"-----END PRIVATE KEY-----"* ]]; then
        # Replace actual newlines with \n and wrap in quotes
        echo "\"$(echo "$key" | tr '\n' '\\n')\""
    else
        echo "$key"
    fi
}

# Main setup function
main() {
    # Check if .env.dokploy exists
    if [ ! -f ".env.dokploy" ]; then
        print_status "ERROR" ".env.dokploy file not found. Please run this script from the project root."
        exit 1
    fi
    
    # Load current environment variables
    set -a
    source .env.dokploy
    set +a
    
    echo "Current Firebase configuration status:"
    echo "===================================="
    
    # Check current status
    local has_placeholders=false
    local firebase_vars=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
        "NEXT_PUBLIC_FIREBASE_APP_ID"
        "FIREBASE_PROJECT_ID"
        "FIREBASE_CLIENT_EMAIL"
        "FIREBASE_PRIVATE_KEY"
    )
    
    for var in "${firebase_vars[@]}"; do
        local value="${!var}"
        if [ -z "$value" ]; then
            print_status "WARN" "$var: Not set"
        elif [[ "$value" == *"REPLACE_WITH"* ]] || [[ "$value" == *"your-"* ]]; then
            print_status "WARN" "$var: Contains placeholder"
            has_placeholders=true
        else
            print_status "OK" "$var: Set"
        fi
    done
    
    if [ "$has_placeholders" = false ]; then
        echo ""
        print_status "OK" "All Firebase variables appear to be configured!"
        echo "Do you want to:"
        echo "1. Continue with current configuration"
        echo "2. Reconfigure Firebase variables"
        echo "3. Exit"
        
        while true; do
            read -p "Choose an option (1-3): " choice
            case $choice in
                1)
                    print_status "OK" "Keeping current configuration"
                    exit 0
                    ;;
                2)
                    break
                    ;;
                3)
                    print_status "INFO" "Exiting without changes"
                    exit 0
                    ;;
                *)
                    print_status "ERROR" "Invalid option. Please choose 1, 2, or 3."
                    ;;
            esac
        done
    fi
    
    echo ""
    print_status "INFO" "Starting Firebase configuration setup..."
    echo ""
    
    # Ask if user has Firebase service account JSON
    echo "Do you have a Firebase service account JSON file?"
    echo "If yes, I can extract the backend configuration automatically."
    echo ""
    
    while true; do
        read -p "Do you have a service account JSON file? (y/n): " has_json
        case $has_json in
            [Yy]*)
                read -p "Enter the path to your service account JSON file: " json_path
                
                if [ -f "$json_path" ]; then
                    print_status "OK" "Found JSON file: $json_path"
                    
                    # Extract values from JSON
                    project_id=$(extract_from_json "$json_path" "project_id")
                    client_email=$(extract_from_json "$json_path" "client_email")
                    private_key=$(extract_from_json "$json_path" "private_key")
                    
                    if [ -n "$project_id" ] && [ -n "$client_email" ] && [ -n "$private_key" ]; then
                        print_status "OK" "Successfully extracted backend configuration from JSON"
                        backend_from_json=true
                        break
                    else
                        print_status "ERROR" "Failed to extract required values from JSON file"
                    fi
                else
                    print_status "ERROR" "File not found: $json_path"
                fi
                ;;
            [Nn]*)
                print_status "INFO" "Will configure manually"
                backend_from_json=false
                break
                ;;
            *)
                print_status "ERROR" "Please answer y or n"
                ;;
        esac
    done
    
    echo ""
    print_status "INFO" "Configuring Frontend Firebase Variables"
    echo "====================================================="
    
    # Get frontend configuration
    api_key=$(prompt_for_value "NEXT_PUBLIC_FIREBASE_API_KEY" 
        "Firebase Web API Key" 
        "^AIza[A-Za-z0-9_-]{35}$" 
        "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" 
        "$NEXT_PUBLIC_FIREBASE_API_KEY")
    
    project_id_frontend=$(prompt_for_value "NEXT_PUBLIC_FIREBASE_PROJECT_ID" 
        "Firebase Project ID" 
        "^[a-z0-9-]+$" 
        "my-project-12345" 
        "$NEXT_PUBLIC_FIREBASE_PROJECT_ID")
    
    # Use project ID from JSON if available and consistent
    if [ "$backend_from_json" = true ] && [ -n "$project_id" ]; then
        if [ -z "$project_id_frontend" ] || [[ "$project_id_frontend" == *"REPLACE_WITH"* ]]; then
            project_id_frontend="$project_id"
            print_status "INFO" "Using project ID from service account JSON: $project_id_frontend"
        elif [ "$project_id_frontend" != "$project_id" ]; then
            print_status "WARN" "Project ID mismatch between frontend and backend. Using backend value: $project_id"
            project_id_frontend="$project_id"
        fi
    fi
    
    auth_domain=$(prompt_for_value "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" 
        "Firebase Auth Domain" 
        "^[a-z0-9-]+\.firebaseapp\.com$" 
        "my-project-12345.firebaseapp.com" 
        "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")
    
    # Auto-generate auth domain if project ID is set
    if [ -n "$project_id_frontend" ] && ([ -z "$auth_domain" ] || [[ "$auth_domain" == *"REPLACE_WITH"* ]]); then
        auth_domain="${project_id_frontend}.firebaseapp.com"
        print_status "INFO" "Auto-generated auth domain: $auth_domain"
    fi
    
    storage_bucket=$(prompt_for_value "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" 
        "Firebase Storage Bucket" 
        "^[a-z0-9-]+\.appspot\.com$" 
        "my-project-12345.appspot.com" 
        "$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET")
    
    # Auto-generate storage bucket if project ID is set
    if [ -n "$project_id_frontend" ] && ([ -z "$storage_bucket" ] || [[ "$storage_bucket" == *"REPLACE_WITH"* ]]); then
        storage_bucket="${project_id_frontend}.appspot.com"
        print_status "INFO" "Auto-generated storage bucket: $storage_bucket"
    fi
    
    messaging_sender_id=$(prompt_for_value "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" 
        "Firebase Messaging Sender ID" 
        "^[0-9]+$" 
        "123456789012" 
        "$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")
    
    app_id=$(prompt_for_value "NEXT_PUBLIC_FIREBASE_APP_ID" 
        "Firebase App ID" 
        "^[1-9][0-9]*:web:[a-zA-Z0-9_-]+$" 
        "1:123456789012:web:abcdef123456789012345678" 
        "$NEXT_PUBLIC_FIREBASE_APP_ID")
    
    echo ""
    print_status "INFO" "Configuring Backend Firebase Variables"
    echo "=================================================="
    
    # Get backend configuration
    if [ "$backend_from_json" = true ]; then
        project_id_backend="$project_id"
        client_email="$client_email"
        private_key=$(format_private_key "$private_key")
        print_status "OK" "Using backend configuration from service account JSON"
    else
        project_id_backend=$(prompt_for_value "FIREBASE_PROJECT_ID" 
            "Firebase Project ID (must match frontend)" 
            "^[a-z0-9-]+$" 
            "my-project-12345" 
            "$FIREBASE_PROJECT_ID")
        
        # Ensure consistency with frontend
        if [ "$project_id_backend" != "$project_id_frontend" ]; then
            print_status "WARN" "Project ID mismatch. Using frontend value: $project_id_frontend"
            project_id_backend="$project_id_frontend"
        fi
        
        client_email=$(prompt_for_value "FIREBASE_CLIENT_EMAIL" 
            "Firebase Service Account Email" 
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" 
            "firebase-adminsdk-xxxxx@my-project-12345.iam.gserviceaccount.com" 
            "$FIREBASE_CLIENT_EMAIL")
        
        echo ""
        print_status "INFO" "Private Key Configuration"
        echo "==============================="
        echo "Please paste your private key exactly as it appears in the JSON file."
        echo "It should start with '-----BEGIN PRIVATE KEY-----' and end with '-----END PRIVATE KEY-----'."
        echo ""
        
        while true; do
            echo "Paste your private key (press Enter on an empty line when done):"
            private_key_lines=""
            while IFS= read -r line; do
                if [ -z "$line" ]; then
                    break
                fi
                private_key_lines="${private_key_lines}${line}\n"
            done
            
            if [[ "$private_key_lines" == *"-----BEGIN PRIVATE KEY-----"* ]] && [[ "$private_key_lines" == *"-----END PRIVATE KEY-----"* ]]; then
                private_key="\"${private_key_lines}\""
                print_status "OK" "Private key formatted successfully"
                break
            else
                print_status "ERROR" "Invalid private key format. Please ensure it includes both BEGIN and END markers."
            fi
        done
    fi
    
    echo ""
    print_status "INFO" "Updating .env.dokploy file"
    echo "==============================="
    
    # Create backup
    cp .env.dokploy .env.dokploy.backup.$(date +%Y%m%d_%H%M%S)
    print_status "OK" "Created backup: .env.dokploy.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update the file
    sed -i.bak "s|^NEXT_PUBLIC_FIREBASE_API_KEY=.*|NEXT_PUBLIC_FIREBASE_API_KEY=$api_key|" .env.dokploy
    sed -i.bak "s|^NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=.*|NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$auth_domain|" .env.dokploy
    sed -i.bak "s|^NEXT_PUBLIC_FIREBASE_PROJECT_ID=.*|NEXT_PUBLIC_FIREBASE_PROJECT_ID=$project_id_frontend|" .env.dokploy
    sed -i.bak "s|^NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=.*|NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$storage_bucket|" .env.dokploy
    sed -i.bak "s|^NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=.*|NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$messaging_sender_id|" .env.dokploy
    sed -i.bak "s|^NEXT_PUBLIC_FIREBASE_APP_ID=.*|NEXT_PUBLIC_FIREBASE_APP_ID=$app_id|" .env.dokploy
    sed -i.bak "s|^FIREBASE_PROJECT_ID=.*|FIREBASE_PROJECT_ID=$project_id_backend|" .env.dokploy
    sed -i.bak "s|^FIREBASE_CLIENT_EMAIL=.*|FIREBASE_CLIENT_EMAIL=$client_email|" .env.dokploy
    sed -i.bak "s|^FIREBASE_PRIVATE_KEY=.*|FIREBASE_PRIVATE_KEY=$private_key|" .env.dokploy
    
    # Update other Firebase variables for consistency
    sed -i.bak "s|^FIREBASE_STORAGE_BUCKET=.*|FIREBASE_STORAGE_BUCKET=$storage_bucket|" .env.dokploy
    sed -i.bak "s|^FIREBASE_MESSAGING_SENDER_ID=.*|FIREBASE_MESSAGING_SENDER_ID=$messaging_sender_id|" .env.dokploy
    sed -i.bak "s|^FIREBASE_APP_ID=.*|FIREBASE_APP_ID=$app_id|" .env.dokploy
    
    # Remove backup file created by sed
    rm -f .env.dokploy.bak
    
    print_status "OK" "Updated .env.dokploy with Firebase configuration"
    
    echo ""
    print_status "INFO" "Verifying configuration"
    echo "============================="
    
    # Run verification script
    if [ -f "./scripts/verify-firebase-config.sh" ]; then
        ./scripts/verify-firebase-config.sh
    else
        print_status "WARN" "Verification script not found. Please run it manually after deployment."
    fi
    
    echo ""
    print_status "OK" "Firebase setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy your application with the updated environment variables"
    echo "2. Visit https://blytz.work/debug/firebase to verify the configuration"
    echo "3. Test the authentication flow"
    echo ""
    echo "If you encounter any issues:"
    echo "- Check the Firebase debug page"
    echo "- Run ./scripts/debug-auth.sh"
    echo "- Review the setup guide: docs/FIREBASE_SETUP_COMPLETE_GUIDE.md"
}

# Run main function
main "$@"