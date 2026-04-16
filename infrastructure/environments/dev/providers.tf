terraform {
  # Strictly define the required Terraform version for enterprise stability
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80" # Pin to a minor version to avoid breaking changes
    }
  }

  # Remote State Backend - Ensure rg-terraform-state and the storage account exist
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "sttfcapstoneXXXX" # Replace XXXX with unique suffix
    container_name       = "tfstate-dev"
    key                  = "dev.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}
