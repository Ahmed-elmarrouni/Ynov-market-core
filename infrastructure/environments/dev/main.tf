# 1. Provide the structural Resource Group wrapper for the environment
resource "azurerm_resource_group" "main" {
  name     = "${var.resource_group_name}-${var.environment}"
  location = var.location
}

# 2. Networking Definition (VNet & Subnet) created natively to host the AKS cluster
resource "azurerm_virtual_network" "main" {
  name                = "vnet-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = var.vnet_address_space
}

resource "azurerm_subnet" "aks" {
  name                 = "snet-aks-${var.environment}"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = var.subnet_address_prefix
}

# 3. Call the internal Custom AKS Module
module "aks" {
  source = "../../modules/aks"

  # Pass parameterized references to the module
  cluster_name        = var.aks_cluster_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = var.aks_dns_prefix
  
  # Inject Node configurations
  node_count          = var.aks_node_count
  node_vm_size        = var.aks_node_vm_size

  # Link AKS functionally back to the defined enterprise Subnet
  vnet_subnet_id      = azurerm_subnet.aks.id
  
  # Meta-tags
  environment         = var.environment
}
