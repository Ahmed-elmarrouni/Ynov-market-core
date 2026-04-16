variable "cluster_name" {
  description = "The name of the Managed Kubernetes Cluster to create."
  type        = string
}

variable "location" {
  description = "The Azure Region in which all resources should be created."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the existing resource group."
  type        = string
}

variable "dns_prefix" {
  description = "DNS prefix specified when creating the managed cluster."
  type        = string
}

variable "node_count" {
  description = "Number of nodes in the AKS default system node pool."
  type        = number
}

variable "node_vm_size" {
  description = "VM size used for the baseline default system node pool."
  type        = string
}

variable "vnet_subnet_id" {
  description = "The ID of the previously created generic Subnet where the nodes will reside."
  type        = string
}

variable "environment" {
  description = "Environment tag (e.g. dev, prod)"
  type        = string
}
