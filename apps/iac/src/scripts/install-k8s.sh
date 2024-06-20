#!/bin/bash
swapoff -a
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

# sysctl params required by setup, params persist across reboots
cat <<EOF | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# Apply sysctl params without reboot
sysctl --system

amazon-linux-extras enable docker
yum install -y containerd

containerd config default > /etc/containerd/config.toml
sed -i 's/^\([[:space:]]*SystemdCgroup[[:space:]]*=[[:space:]]*\)false/\1true/' /etc/containerd/config.toml
systemctl enable containerd
systemctl start containerd

#wget https://go.dev/dl/go1.22.4.linux-amd64.tar.gz
#tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz
#echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

systemctl status containerd

# Install kubeclt, kubeadm, kubectl

setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

cat <<EOF | tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://pkgs.k8s.io/core:/stable:/v1.29/rpm/
enabled=1
gpgcheck=1
gpgkey=https://pkgs.k8s.io/core:/stable:/v1.29/rpm/repodata/repomd.xml.key
exclude=kubelet kubeadm kubectl cri-tools kubernetes-cni
EOF

yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes --disableplugin=priorities

#systemctl enable --now kubelet

kubeadm init --pod-network-cidr=192.168.0.0/16

curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh

#helm repo add cilium https://helm.cilium.io
#helm install cilium cilium/cilium --version 1.15.6 \
#  --namespace kube-system \
#  --set ipam.operator.clusterPoolIPv4PodCIDRList="192.168.0.0/16"
export PATH=$PATH:/usr/local/sbin
helm repo add projectcalico https://docs.tigera.io/calico/charts
export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl create namespace tigera-operator
helm install calico projectcalico/tigera-operator --version v3.28.0 --namespace tigera-operator

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx

sed -i '$ a export PATH=$PATH:/usr/local/sbin' ~/.bashrc
sed -i '$ a alias k=kubectl' ~/.bashrc
touch ~/.profile
sed -i '$ a source ~/.bashrc' ~/.profile

#su ec2-user
#mkdir -p $HOME/.kube
#cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
#chown $(id -u):$(id -g) $HOME/.kube/config
#echo 'export PATH=$PATH:/usr/local/sbin' >> ~/.bashrc
#echo 'alias k=kubectl' >> ~/.bashrc
#. ~/.bashrc

#sudo su ssm-user
#mkdir -p $HOME/.kube
#sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
#sudo chown $(id -u):$(id -g) $HOME/.kube/config
#echo 'export PATH=$PATH:/usr/local/sbin' >> ~/.bashrc
#echo 'alias k=kubectl' >> ~/.bashrc
#. ~/.bashrc

#kubeadm token create --print-join-command > output.text
