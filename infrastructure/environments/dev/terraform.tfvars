# Enterprise configuration mapping for the 'dev' environment
location              = "West Europe"
environment           = "dev"
resource_group_name   = "rg-capstone"
vnet_address_space    = ["10.0.0.0/16"]
subnet_address_prefix = ["10.0.1.0/24"]

# Kubernetes Cluster specific configurations
aks_cluster_name      = "aks-capstone-dev"
aks_dns_prefix        = "capstonedev"
aks_node_count        = 2
aks_node_vm_size      = "Standard_B2s"
