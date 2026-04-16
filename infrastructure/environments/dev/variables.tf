variable "location" {
  description = "The Azure Region where the resources should be deployed."
  type        = string
  default     = "West Europe"
}

variable "environment" {
  description = "The name of the environment (e.g., dev, prod)."
  type        = string
}

variable "resource_group_name" {
  description = "The base name for the resource group."
  type        = string
}

variable "vnet_address_space" {
  description = "Address space for the Virtual Network."
  type        = list(string)
}

variable "subnet_address_prefix" {
  description = "Address prefix for the generic Subnet."
  type        = list(string)
}

variable "aks_cluster_name" {
  description = "The name of the AKS cluster."
  type        = string
}

variable "aks_dns_prefix" {
  description = "DNS prefix specified when creating the managed cluster."
  type        = string
}

variable "aks_node_count" {
  description = "The default number of nodes in the AKS cluster pool."
  type        = number
  default     = 2
}

variable "aks_node_vm_size" {
  description = "The VM size representing the system node pool."
  type        = string
  default     = "Standard_B2s"
}
