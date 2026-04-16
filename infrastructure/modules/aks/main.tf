# Highly structured Azure Kubernetes Service (AKS) Module

resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.cluster_name
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = var.dns_prefix

  # Default System Node Pool mapping
  default_node_pool {
    name           = "systempool"
    node_count     = var.node_count
    vm_size        = var.node_vm_size
    vnet_subnet_id = var.vnet_subnet_id
  }

  # Hard DevSecOps Requirement: System Assigned Managed Identities
  identity {
    type = "SystemAssigned"
  }

  # Hard DevSecOps Requirement: Strict Role Based Access Control
  role_based_access_control_enabled = true

  # Native network specifications
  network_profile {
    network_plugin    = "azure"
    load_balancer_sku = "standard"
  }

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
